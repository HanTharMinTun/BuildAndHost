import os
import re
import shutil
import subprocess
import time
import uuid
from pathlib import Path
from typing import Optional

import psycopg2
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Deployment, DeploymentLog


# Configuration
BASE_DOMAIN = "onlinegif.shop"
PORT_RANGE_START = 8000
PORT_RANGE_END = 8999
PORTFOLIO_BACKEND_TEMPLATE = Path(__file__).parent.parent.parent / "portfolio_backend"
DEPLOYMENTS_DIR = Path(__file__).parent.parent.parent / "portfolio_backend" / "deployments"
NGINX_SITES_AVAILABLE = Path("/etc/nginx/sites-available")
NGINX_SITES_ENABLED = Path("/etc/nginx/sites-enabled")
SYSTEMD_SERVICE_DIR = Path("/etc/systemd/system")

# Database credentials (from portfolio backend)
DB_USER = "postgres"
DB_PASSWORD = "root"
DB_HOST = "localhost"
DB_PORT = "5432"


class DeploymentManager:
    """Manages the deployment of portfolio websites"""

    def __init__(self, db: AsyncSession, deployment_id: uuid.UUID):
        self.db = db
        self.deployment_id = deployment_id
        self.deployment: Optional[Deployment] = None

    async def log(self, message: str, level: str = "INFO"):
        """Add a log entry for this deployment"""
        log = DeploymentLog(
            deployment_id=self.deployment_id,
            level=level,
            message=message,
        )
        self.db.add(log)
        await self.db.flush()
        print(f"[{level}] Deployment {self.deployment_id}: {message}")

    async def update_status(self, status: str, error_message: Optional[str] = None):
        """Update deployment status"""
        if self.deployment:
            self.deployment.status = status
            if error_message:
                self.deployment.error_message = error_message
            await self.db.flush()

    @staticmethod
    def validate_subdomain(subdomain: str) -> bool:
        """Validate subdomain format"""
        # Allow lowercase alphanumeric and hyphens, must start/end with alphanumeric
        # Length: 1-63 characters
        pattern = r'^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'
        return bool(re.match(pattern, subdomain.lower()))

    @staticmethod
    def sanitize_subdomain(subdomain: str) -> str:
        """Convert subdomain to lowercase and validate"""
        subdomain = subdomain.lower().strip()
        if not DeploymentManager.validate_subdomain(subdomain):
            raise ValueError(f"Invalid subdomain format: {subdomain}")
        return subdomain

    async def check_subdomain_available(self, subdomain: str) -> bool:
        """Check if subdomain is not already taken"""
        result = await self.db.scalar(
            select(Deployment).where(
                and_(
                    Deployment.subdomain == subdomain,
                    Deployment.status.in_(["DEPLOYING", "RUNNING"])
                )
            )
        )
        return result is None

    async def allocate_port(self) -> int:
        """Allocate a unique port for this deployment"""
        await self.log("Allocating port...")
        
        # Get all allocated ports in DEPLOYING or RUNNING state
        result = await self.db.scalars(
            select(Deployment.port).where(
                Deployment.status.in_(["DEPLOYING", "RUNNING"])
            )
        )
        allocated_ports = set(result.all())
        
        # Find first available port
        for port in range(PORT_RANGE_START, PORT_RANGE_END + 1):
            if port not in allocated_ports:
                # Double-check port is not in use by system
                if not self.is_port_in_use(port):
                    await self.log(f"Port {port} allocated")
                    return port
        
        raise RuntimeError("No available ports in range")

    @staticmethod
    def is_port_in_use(port: int) -> bool:
        """Check if port is in use on the system"""
        try:
            result = subprocess.run(
                ["ss", "-tuln"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            return f":{port}" in result.stdout
        except Exception:
            return False

    def create_database(self, database_name: str, sql_script_path: Path) -> bool:
        """Create a new PostgreSQL database and initialize schema"""
        try:
            # Connect to postgres database to create new database
            conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASSWORD,
                database="postgres",
            )
            conn.autocommit = True
            cursor = conn.cursor()
            
            # Create database
            cursor.execute(f"CREATE DATABASE {database_name}")
            cursor.close()
            conn.close()
            
            # Connect to new database and execute schema
            conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASSWORD,
                database=database_name,
            )
            cursor = conn.cursor()
            
            # Read and execute SQL script
            with open(sql_script_path, 'r') as f:
                sql_script = f.read()
            
            cursor.execute(sql_script)
            conn.commit()
            cursor.close()
            conn.close()
            
            return True
            
        except Exception as e:
            raise RuntimeError(f"Database creation failed: {str(e)}")

    def get_database_url(self, database_name: str) -> str:
        """Generate database URL for deployment"""
        return f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{database_name}"

    def copy_backend(self, deployment_path: Path) -> bool:
        """Copy portfolio backend template to deployment directory"""
        try:
            if deployment_path.exists():
                shutil.rmtree(deployment_path)
            
            shutil.copytree(PORTFOLIO_BACKEND_TEMPLATE, deployment_path)
            return True
            
        except Exception as e:
            raise RuntimeError(f"Backend copy failed: {str(e)}")

    def update_database_config(self, deployment_path: Path, database_url: str) -> bool:
        """Update database.py in deployment with new database URL"""
        try:
            database_py = deployment_path / "app" / "database.py"
            
            with open(database_py, 'r') as f:
                content = f.read()
            
            # Replace DATABASE_URL line
            pattern = r'DATABASE_URL\s*=\s*["\'].*?["\']'
            replacement = f'DATABASE_URL = "{database_url}"'
            updated_content = re.sub(pattern, replacement, content)
            
            with open(database_py, 'w') as f:
                f.write(updated_content)
            
            return True
            
        except Exception as e:
            raise RuntimeError(f"Database config update failed: {str(e)}")

    def get_python_path(self) -> str:
        """Get Python virtual environment path"""
        # Check if we're in a virtual environment
        venv_python = Path(__file__).parent.parent.parent.parent / "venv" / "bin" / "python3"
        if venv_python.exists():
            return str(venv_python)
        
        # Fallback to system python
        return "/usr/bin/python3"

    def get_uvicorn_path(self) -> str:
        """Get uvicorn path"""
        venv_uvicorn = Path(__file__).parent.parent.parent.parent / "venv" / "bin" / "uvicorn"
        if venv_uvicorn.exists():
            return str(venv_uvicorn)
        
        return "/usr/local/bin/uvicorn"

    def create_systemd_service(self, subdomain: str, deployment_path: Path, port: int) -> str:
        """Create systemd service file for deployment"""
        service_name = f"buildandhost-{subdomain}.service"
        service_path = SYSTEMD_SERVICE_DIR / service_name
        
        uvicorn_path = self.get_uvicorn_path()
        
        # Service file content
        service_content = f"""[Unit]
Description=BuildAndHost Portfolio - {subdomain}
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory={deployment_path}
Environment="PATH={deployment_path.parent.parent.parent}/venv/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart={uvicorn_path} app.main:app --host 127.0.0.1 --port {port}
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
"""
        
        try:
            # Write service file (requires sudo)
            with open(service_path, 'w') as f:
                f.write(service_content)
            
            # Reload systemd daemon
            subprocess.run(
                ["systemctl", "daemon-reload"],
                check=True,
                timeout=10,
            )
            
            return service_name
            
        except Exception as e:
            raise RuntimeError(f"Systemd service creation failed: {str(e)}")

    def start_systemd_service(self, service_name: str) -> bool:
        """Start the systemd service"""
        try:
            # Enable service
            subprocess.run(
                ["systemctl", "enable", service_name],
                check=True,
                timeout=10,
            )
            
            # Start service
            subprocess.run(
                ["systemctl", "start", service_name],
                check=True,
                timeout=10,
            )
            
            # Wait a moment for service to start
            time.sleep(2)
            
            # Check if service is active
            result = subprocess.run(
                ["systemctl", "is-active", service_name],
                capture_output=True,
                text=True,
                timeout=5,
            )
            
            return result.stdout.strip() == "active"
            
        except Exception as e:
            raise RuntimeError(f"Service start failed: {str(e)}")

    def check_backend_health(self, port: int, max_retries: int = 10) -> bool:
        """Check if backend is responding"""
        import urllib.request
        import urllib.error
        
        url = f"http://127.0.0.1:{port}/health"
        
        for attempt in range(max_retries):
            try:
                with urllib.request.urlopen(url, timeout=2) as response:
                    if response.status == 200:
                        return True
            except (urllib.error.URLError, urllib.error.HTTPError):
                pass
            
            time.sleep(1)
        
        return False

    def create_nginx_config(self, subdomain: str, port: int) -> str:
        """Create Nginx configuration for deployment"""
        domain = f"{subdomain}.{BASE_DOMAIN}"
        config_name = f"buildandhost-{subdomain}"
        config_path = NGINX_SITES_AVAILABLE / config_name
        
        nginx_content = f"""server {{
    listen 80;
    server_name {domain};

    location / {{
        proxy_pass http://127.0.0.1:{port};
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }}
}}
"""
        
        try:
            # Write config file
            with open(config_path, 'w') as f:
                f.write(nginx_content)
            
            # Create symlink in sites-enabled
            enabled_path = NGINX_SITES_ENABLED / config_name
            if enabled_path.exists():
                enabled_path.unlink()
            
            enabled_path.symlink_to(config_path)
            
            return config_name
            
        except Exception as e:
            raise RuntimeError(f"Nginx config creation failed: {str(e)}")

    def test_and_reload_nginx(self) -> bool:
        """Test Nginx configuration and reload if valid"""
        try:
            # Test configuration
            result = subprocess.run(
                ["nginx", "-t"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            
            if result.returncode != 0:
                raise RuntimeError(f"Nginx test failed: {result.stderr}")
            
            # Reload Nginx
            subprocess.run(
                ["systemctl", "reload", "nginx"],
                check=True,
                timeout=10,
            )
            
            return True
            
        except Exception as e:
            raise RuntimeError(f"Nginx reload failed: {str(e)}")

    async def deploy(self, subdomain: str) -> bool:
        """
        Main deployment orchestration method
        Returns True on success, False on failure
        """
        deployment_path = None
        service_name = None
        nginx_config = None
        database_name = None
        port = None
        
        try:
            # Load deployment record
            self.deployment = await self.db.scalar(
                select(Deployment).where(Deployment.id == self.deployment_id)
            )
            if not self.deployment:
                raise RuntimeError("Deployment record not found")
            
            await self.log("Starting deployment process")
            await self.update_status("DEPLOYING")
            
            # Step 1: Validate subdomain
            await self.log(f"Validating subdomain: {subdomain}")
            subdomain = self.sanitize_subdomain(subdomain)
            
            # Step 2: Check/Allocate port
            if self.deployment.port and self.deployment.port != 0:
                # Port already allocated in the endpoint
                port = self.deployment.port
                await self.log(f"Using pre-allocated port: {port}")
            else:
                # Port not allocated, allocate it now
                port = await self.allocate_port()
                self.deployment.port = port
                await self.db.flush()
            
            # Step 3: Create database
            database_name = f"buildandhost_{subdomain}"
            await self.log(f"Creating database: {database_name}")
            sql_script = PORTFOLIO_BACKEND_TEMPLATE / "database_table.sql"
            self.create_database(database_name, sql_script)
            await self.log("Database created successfully")
            self.deployment.database_name = database_name
            await self.db.flush()
            
            # Step 4: Copy backend
            deployment_path = DEPLOYMENTS_DIR / subdomain
            await self.log(f"Copying backend to: {deployment_path}")
            DEPLOYMENTS_DIR.mkdir(parents=True, exist_ok=True)
            self.copy_backend(deployment_path)
            await self.log("Backend copied successfully")
            self.deployment.backend_path = str(deployment_path)
            await self.db.flush()
            
            # Step 5: Update database configuration
            await self.log("Updating database configuration")
            database_url = self.get_database_url(database_name)
            self.update_database_config(deployment_path, database_url)
            await self.log("Database configuration updated")
            
            # Step 6: Create systemd service
            await self.log("Creating systemd service")
            service_name = self.create_systemd_service(subdomain, deployment_path, port)
            await self.log(f"Systemd service created: {service_name}")
            self.deployment.systemd_service = service_name
            await self.db.flush()
            
            # Step 7: Start systemd service
            await self.log("Starting systemd service")
            if not self.start_systemd_service(service_name):
                raise RuntimeError("Service failed to start")
            await self.log("Systemd service started")
            
            # Step 8: Health check
            await self.log("Performing health check")
            if not self.check_backend_health(port):
                raise RuntimeError("Backend health check failed")
            await self.log("Backend is healthy")
            
            # Step 9: Create Nginx configuration
            await self.log("Creating Nginx configuration")
            nginx_config = self.create_nginx_config(subdomain, port)
            await self.log(f"Nginx configuration created: {nginx_config}")
            
            # Step 10: Test and reload Nginx
            await self.log("Testing Nginx configuration")
            self.test_and_reload_nginx()
            await self.log("Nginx reloaded successfully")
            
            # Step 11: Final verification
            await self.log("Deployment completed successfully")
            await self.update_status("RUNNING")
            
            return True
            
        except Exception as e:
            error_msg = str(e)
            await self.log(f"Deployment failed: {error_msg}", level="ERROR")
            await self.update_status("FAILED", error_msg)
            
            # Attempt cleanup
            await self.log("Starting rollback", level="WARNING")
            await self.rollback(
                subdomain=subdomain,
                service_name=service_name,
                nginx_config=nginx_config,
                deployment_path=deployment_path,
            )
            
            return False

    async def rollback(
        self,
        subdomain: str,
        service_name: Optional[str] = None,
        nginx_config: Optional[str] = None,
        deployment_path: Optional[Path] = None,
    ):
        """Clean up failed deployment"""
        await self.log("Rolling back deployment", level="WARNING")
        
        # Stop and disable systemd service
        if service_name:
            try:
                subprocess.run(["systemctl", "stop", service_name], timeout=10)
                subprocess.run(["systemctl", "disable", service_name], timeout=10)
                service_file = SYSTEMD_SERVICE_DIR / service_name
                if service_file.exists():
                    service_file.unlink()
                subprocess.run(["systemctl", "daemon-reload"], timeout=10)
                await self.log(f"Removed systemd service: {service_name}")
            except Exception as e:
                await self.log(f"Failed to remove service: {e}", level="WARNING")
        
        # Remove Nginx configuration
        if nginx_config:
            try:
                config_path = NGINX_SITES_AVAILABLE / nginx_config
                enabled_path = NGINX_SITES_ENABLED / nginx_config
                
                if enabled_path.exists():
                    enabled_path.unlink()
                if config_path.exists():
                    config_path.unlink()
                
                subprocess.run(["nginx", "-t"], timeout=10, capture_output=True)
                subprocess.run(["systemctl", "reload", "nginx"], timeout=10)
                await self.log(f"Removed Nginx config: {nginx_config}")
            except Exception as e:
                await self.log(f"Failed to remove Nginx config: {e}", level="WARNING")
        
        # Remove backend directory
        if deployment_path and deployment_path.exists():
            try:
                shutil.rmtree(deployment_path)
                await self.log(f"Removed backend directory: {deployment_path}")
            except Exception as e:
                await self.log(f"Failed to remove backend: {e}", level="WARNING")
        
        await self.log("Rollback completed")
