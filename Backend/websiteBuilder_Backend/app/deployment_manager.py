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
        """
        Allocate a unique port for this deployment.
        Checks all deployments (including FAILED) to avoid constraint violations.
        """
        await self.log("Allocating port...")
        
        # Get all allocated ports from ALL deployments (including FAILED ones)
        result = await self.db.execute(
            select(Deployment.port)
        )
        allocated_ports = set(row[0] for row in result.fetchall() if row[0] is not None and row[0] != 0)
        
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
        """Create a new PostgreSQL database and initialize schema using sudo"""
        try:
            # Create database using sudo -u postgres
            result = subprocess.run(
                ["sudo", "-u", "postgres", "psql", "-c", f"CREATE DATABASE {database_name}"],
                capture_output=True,
                text=True,
                timeout=30,
            )
            
            # Check if database was created (ignore error if already exists)
            if result.returncode != 0 and "already exists" not in result.stderr:
                raise RuntimeError(f"CREATE DATABASE failed: {result.stderr}")
            
            # Read SQL script content and pipe it to psql (avoids permission issues)
            with open(sql_script_path, 'r') as f:
                sql_content = f.read()
            
            # Execute schema SQL script by piping content to psql
            result = subprocess.run(
                ["sudo", "-u", "postgres", "psql", "-d", database_name],
                input=sql_content,
                capture_output=True,
                text=True,
                timeout=60,
            )
            
            if result.returncode != 0:
                raise RuntimeError(f"Schema initialization failed: {result.stderr}")
            
            # Grant privileges to the application user
            grant_sql = f"GRANT ALL PRIVILEGES ON DATABASE {database_name} TO {DB_USER};"
            subprocess.run(
                ["sudo", "-u", "postgres", "psql", "-c", grant_sql],
                capture_output=True,
                text=True,
                timeout=10,
            )
            
            return True
            
        except subprocess.TimeoutExpired:
            raise RuntimeError("Database creation timeout")
        except Exception as e:
            raise RuntimeError(f"Database creation failed: {str(e)}")

    def get_database_url(self, database_name: str) -> str:
        """Generate database URL for deployment"""
        return f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{database_name}"

    def get_project_venv(self) -> Path:
        """Return the project virtual environment directory if present."""
        return Path(__file__).resolve().parents[3] / ".venv"

    def copy_backend(self, deployment_path: Path) -> bool:
        """Copy portfolio backend template to deployment directory"""
        try:
            if deployment_path.exists():
                shutil.rmtree(deployment_path)
            
            # Ignore the deployments directory to prevent recursive copy
            def ignore_deployments(dir, files):
                return ['deployments', '__pycache__', '*.pyc', '.env'] if 'deployments' in files else []
            
            shutil.copytree(PORTFOLIO_BACKEND_TEMPLATE, deployment_path, ignore=ignore_deployments)
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

    def install_dependencies(self, deployment_path: Path) -> bool:
        """Install Python dependencies for the deployed backend"""
        try:
            requirements_file = deployment_path / "requirements.txt"
            
            # Check if requirements.txt exists
            if not requirements_file.exists():
                # If no requirements.txt, try to find one in parent
                template_requirements = PORTFOLIO_BACKEND_TEMPLATE / "requirements.txt"
                if template_requirements.exists():
                    shutil.copy(template_requirements, requirements_file)
                else:
                    raise RuntimeError("No requirements.txt found")

            python_executable = self.get_python_path()
            
            # Install dependencies using the active project Python interpreter
            result = subprocess.run(
                [python_executable, "-m", "pip", "install", "-r", str(requirements_file)],
                capture_output=True,
                text=True,
                timeout=180,  # 3 minutes for installation
                cwd=str(deployment_path),
            )
            
            if result.returncode != 0:
                raise RuntimeError(f"pip install failed: {result.stderr}")
            
            return True
            
        except subprocess.TimeoutExpired:
            raise RuntimeError("Dependency installation timeout")
        except Exception as e:
            raise RuntimeError(f"Dependency installation failed: {str(e)}")

    def get_python_path(self) -> str:
        """Return the Python interpreter used by the project virtual environment when available."""
        venv_python = self.get_project_venv() / "bin" / "python"
        if venv_python.exists():
            return str(venv_python)
        return "/usr/bin/python3"

    def get_uvicorn_path(self) -> str:
        """Prefer the project virtual environment's uvicorn before system fallbacks."""
        venv_uvicorn = self.get_project_venv() / "bin" / "uvicorn"
        if venv_uvicorn.exists():
            return str(venv_uvicorn)
        for path in ["/usr/local/bin/uvicorn", "/usr/bin/uvicorn"]:
            if Path(path).exists():
                return path
        return "/usr/bin/uvicorn"

    def create_systemd_service(self, subdomain: str, deployment_path: Path, port: int) -> str:
        """Create systemd service file for deployment"""
        service_name = f"buildandhost-{subdomain}.service"
        service_path = SYSTEMD_SERVICE_DIR / service_name
        
        uvicorn_path = self.get_uvicorn_path()
        venv_bin = self.get_project_venv() / "bin"
        path_value = str(venv_bin) + ":/usr/local/bin:/usr/bin:/bin" if venv_bin.exists() else "/usr/local/bin:/usr/bin:/bin"

        # Service file content
        service_content = f"""[Unit]
Description=BuildAndHost Portfolio - {subdomain}
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory={deployment_path}
Environment="PATH={path_value}"
Environment="PYTHONPATH={deployment_path}"
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
            # First write to temp file, then move with sudo
            import tempfile
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.service') as tmp:
                tmp.write(service_content)
                tmp_path = tmp.name
            
            # Move temp file to systemd directory with sudo
            subprocess.run(
                ["sudo", "mv", tmp_path, str(service_path)],
                check=True,
                timeout=10,
            )
            
            # Set proper permissions
            subprocess.run(
                ["sudo", "chmod", "644", str(service_path)],
                check=True,
                timeout=10,
            )
            
            # Reload systemd daemon
            subprocess.run(
                ["sudo", "/bin/systemctl", "daemon-reload"],
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
                ["sudo", "/bin/systemctl", "enable", service_name],
                check=True,
                timeout=10,
            )
            
            # Start service
            subprocess.run(
                ["sudo", "/bin/systemctl", "start", service_name],
                check=True,
                timeout=10,
            )
            
            # Wait a moment for service to start
            time.sleep(8)
            
            # Check if service is active
            result = subprocess.run(
                ["sudo", "/bin/systemctl", "is-active", service_name],
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
        """Create Nginx configuration for deployment - proxies to shared React server"""
        domain = f"{subdomain}.{BASE_DOMAIN}"
        config_name = f"buildandhost-{subdomain}"
        config_path = NGINX_SITES_AVAILABLE / config_name
        
        # Shared React/Vite UI server port
        REACT_SERVER_PORT = 5173
        
        # Main builder backend port for public API
        BUILDER_BACKEND_PORT = 8001
        
        nginx_content = f"""server {{
    listen 80;
    server_name {domain};

    # Proxy all root requests to the shared React/Vite UI server
    # The React app will detect the subdomain and load the appropriate website
    location / {{
        proxy_pass http://127.0.0.1:{REACT_SERVER_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}

    # Public API requests (for fetching website data) go to main builder backend
    # This must come before the general /api/ location block (Nginx matches most specific first)
    location /api/public/ {{
        proxy_pass http://127.0.0.1:{BUILDER_BACKEND_PORT};
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }}

    # Other API requests are proxied to this deployment's specific backend
    # (for future CRUD operations on this website's data)
    location /api/ {{
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
            # Write config file with sudo
            import tempfile
            with tempfile.NamedTemporaryFile(mode='w', delete=False) as tmp:
                tmp.write(nginx_content)
                tmp_path = tmp.name
            
            # Move temp file to nginx directory with sudo
            subprocess.run(
                ["sudo", "mv", tmp_path, str(config_path)],
                check=True,
                timeout=10,
            )
            
            # Set proper permissions
            subprocess.run(
                ["sudo", "chmod", "644", str(config_path)],
                check=True,
                timeout=10,
            )
            
            # Create symlink in sites-enabled
            enabled_path = NGINX_SITES_ENABLED / config_name
            if enabled_path.exists():
                subprocess.run(
                    ["sudo", "rm", str(enabled_path)],
                    check=True,
                    timeout=10,
                )
            
            subprocess.run(
                ["sudo", "ln", "-s", str(config_path), str(enabled_path)],
                check=True,
                timeout=10,
            )
            
            return config_name
            
        except Exception as e:
            raise RuntimeError(f"Nginx config creation failed: {str(e)}")

    def test_and_reload_nginx(self) -> bool:
        """Test Nginx configuration and reload if valid"""
        try:
            # Test configuration
            result = subprocess.run(
                ["sudo", "/usr/sbin/nginx", "-t"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            
            if result.returncode != 0:
                raise RuntimeError(f"Nginx test failed: {result.stderr}")
            
            # Reload Nginx
            subprocess.run(
                ["sudo", "/bin/systemctl", "reload", "nginx"],
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
            
            # Step 5: Install dependencies
            await self.log("Installing Python dependencies")
            self.install_dependencies(deployment_path)
            await self.log("Dependencies installed successfully")
            
            # Step 6: Update database configuration
            await self.log("Updating database configuration")
            database_url = self.get_database_url(database_name)
            self.update_database_config(deployment_path, database_url)
            await self.log("Database configuration updated")
            
            # Step 7: Create systemd service
            await self.log("Creating systemd service")
            service_name = self.create_systemd_service(subdomain, deployment_path, port)
            await self.log(f"Systemd service created: {service_name}")
            self.deployment.systemd_service = service_name
            await self.db.flush()
            
            # Step 8: Start systemd service
            await self.log("Starting systemd service")
            if not self.start_systemd_service(service_name):
                raise RuntimeError("Service failed to start")
            await self.log("Systemd service started")
            
            # Step 9: Health check
            await self.log("Performing health check")
            if not self.check_backend_health(port):
                raise RuntimeError("Backend health check failed")
            await self.log("Backend is healthy")
            
            # Step 10: Create Nginx configuration
            await self.log("Creating Nginx configuration")
            nginx_config = self.create_nginx_config(subdomain, port)
            await self.log(f"Nginx configuration created: {nginx_config}")
            
            # Step 11: Test and reload Nginx
            await self.log("Testing Nginx configuration")
            self.test_and_reload_nginx()
            await self.log("Nginx reloaded successfully")
            

            # Step 12: Setup SSL certificate
            await self.log("Setting up SSL certificate")
            self.setup_ssl_certificate(subdomain)
            await self.log("SSL certificate installed")

            # Step 13: Test and reload Nginx again
            await self.log("Testing Nginx configuration after SSL")
            self.test_and_reload_nginx()
            await self.log("Nginx reloaded successfully")

            # Step 14: Final verification
            await self.log("Deployment completed successfully")
            await self.update_status("RUNNING")

            # # Step 12: Final verification
            # await self.log("Deployment completed successfully")
            # await self.update_status("RUNNING")
            
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
                subprocess.run(["sudo", "/bin/systemctl", "stop", service_name], timeout=10)
                subprocess.run(["sudo", "/bin/systemctl", "disable", service_name], timeout=10)
                service_file = SYSTEMD_SERVICE_DIR / service_name
                if service_file.exists():
                    subprocess.run(["sudo", "rm", str(service_file)], timeout=10)
                subprocess.run(["sudo", "/bin/systemctl", "daemon-reload"], timeout=10)
                await self.log(f"Removed systemd service: {service_name}")
            except Exception as e:
                await self.log(f"Failed to remove service: {e}", level="WARNING")
        
        # Remove Nginx configuration
        if nginx_config:
            try:
                config_path = NGINX_SITES_AVAILABLE / nginx_config
                enabled_path = NGINX_SITES_ENABLED / nginx_config
                
                if enabled_path.exists():
                    subprocess.run(["sudo", "rm", str(enabled_path)], timeout=10)
                if config_path.exists():
                    subprocess.run(["sudo", "rm", str(config_path)], timeout=10)
                
                subprocess.run(["sudo", "/usr/sbin/nginx", "-t"], timeout=10, capture_output=True)
                subprocess.run(["sudo", "/bin/systemctl", "reload", "nginx"], timeout=10)
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



    def setup_ssl_certificate(self, subdomain: str) -> bool:
        """Get SSL certificate for subdomain using certbot"""
        domain = f"{subdomain}.{BASE_DOMAIN}"
        
        try:
            # Run certbot to get SSL certificate
            result = subprocess.run(
                [
                    "sudo", "certbot", "--nginx",
                    "-d", domain,
                    "--non-interactive",
                    "--agree-tos",
                    "--email", "admin@onlinegif.shop",  # Change to your email
                    "--redirect"
                ],
                capture_output=True,
                text=True,
                timeout=120,
            )
            
            if result.returncode != 0:
                raise RuntimeError(f"Certbot failed: {result.stderr}")
            
            return True
            
        except subprocess.TimeoutExpired:
            raise RuntimeError("SSL certificate generation timeout")
        except Exception as e:
            raise RuntimeError(f"SSL certificate generation failed: {str(e)}")