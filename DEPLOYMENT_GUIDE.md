# BuildAndHost Deployment System - Setup Guide

## Overview

This deployment system allows users to deploy their generated portfolio websites to unique subdomains on `onlinegif.shop`. Each deployment gets its own:

- Isolated database
- Unique port (8000-8999 range)
- Dedicated systemd service
- Individual Nginx server block
- Separate portfolio backend instance

## Architecture

```
BuildAndHost (Main Application)
    |
    ├── Backend/websiteBuilder_Backend/     (Main backend - FastAPI)
    │   ├── API endpoints for deployment management
    │   └── DeploymentManager orchestration
    |
    └── Backend/portfolio_backend/           (Template for deployments)
        │
        ├── deployments/                     (Generated deployments)
        │   ├── hanthar/                    (Example deployment)
        │   │   ├── app/
        │   │   │   ├── main.py
        │   │   │   ├── database.py         (points to buildandhost_hanthar)
        │   │   │   └── ...
        │   │   └── ...
        │   └── john/                        (Another deployment)
        │       └── ...
        │
        └── database_table.sql               (Template schema)
```

## Files Created/Modified

### Backend Files Created:
1. **Backend/websiteBuilder_Backend/app/models.py** - Added:
   - `Deployment` model
   - `DeploymentLog` model
   - Relationships to existing models

2. **Backend/websiteBuilder_Backend/app/schemas.py** - Added:
   - `DeploymentCreate`
   - `DeploymentResponse`
   - `DeploymentLogResponse`

3. **Backend/websiteBuilder_Backend/app/deployment_manager.py** (NEW)
   - Complete deployment orchestration
   - Database creation and initialization
   - Backend cloning and configuration
   - Port allocation
   - Systemd service management
   - Nginx configuration
   - Health checks
   - Rollback on failure

4. **Backend/websiteBuilder_Backend/app/routers/deployments.py** (NEW)
   - POST `/api/deployments/websites/{website_id}` - Deploy a website
   - GET `/api/deployments/{deployment_id}` - Get deployment status
   - GET `/api/deployments/{deployment_id}/logs` - Get deployment logs
   - GET `/api/deployments/website/{website_id}` - List website deployments

5. **Backend/websiteBuilder_Backend/app/main.py** - Modified:
   - Added deployment router

6. **Backend/websiteBuilder_Backend/migrations/add_deployment_tables.py** (NEW)
   - Database migration script

### Frontend Files Created:
1. **ai-website-builder/src/pages/deploy.tsx** (NEW/MODIFIED)
   - Complete deployment UI
   - Subdomain input with validation
   - Real-time deployment status
   - Log streaming
   - Success/failure handling

2. **ai-website-builder/src/lib/types.ts** - Added:
   - `Deployment` interface
   - `DeploymentCreate` interface
   - `DeploymentLog` interface

3. **ai-website-builder/src/lib/api.ts** - Added:
   - `deployWebsite()`
   - `getDeployment()`
   - `getDeploymentLogs()`
   - `getWebsiteDeployments()`

4. **ai-website-builder/src/App.tsx** - Already had deploy route

## Installation Steps

### 1. Install Dependencies

```bash
# Backend dependencies
cd Backend/websiteBuilder_Backend
pip install -r requirements.txt

# This includes:
# - psycopg2-binary (for PostgreSQL operations)
```

### 2. Database Migration

Run the migration to create deployment tables:

```bash
cd Backend/websiteBuilder_Backend
python migrations/add_deployment_tables.py
```

Or manually execute the SQL:
```sql
-- See Backend/websiteBuilder_Backend/migrations/add_deployment_tables.py
-- for the complete SQL schema
```

### 3. Ensure Deployments Directory Exists

```bash
mkdir -p Backend/portfolio_backend/deployments
```

### 4. System Requirements

The deployment system requires the following to be installed on the VPS:

#### PostgreSQL
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Nginx
```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Python Virtual Environment
```bash
cd /home/bn-x/Desktop/BuildAndDeploy
python3 -m venv venv
source venv/bin/activate
pip install -r Backend/websiteBuilder_Backend/requirements.txt
```

### 5. System Permissions

The deployment manager needs permissions to:
- Create systemd service files in `/etc/systemd/system/`
- Create Nginx configs in `/etc/nginx/sites-available/` and `/etc/nginx/sites-enabled/`
- Reload systemd and nginx

#### Option A: Run as root (NOT RECOMMENDED for production)
```bash
sudo uvicorn app.main:app --host 0.0.0.0 --port 8080
```

#### Option B: Setup sudo permissions (RECOMMENDED)
```bash
# Create a sudoers file for the deployment operations
sudo visudo -f /etc/sudoers.d/buildandhost

# Add these lines (replace 'your-username' with actual username):
your-username ALL=(ALL) NOPASSWD: /bin/systemctl daemon-reload
your-username ALL=(ALL) NOPASSWD: /bin/systemctl enable buildandhost-*
your-username ALL=(ALL) NOPASSWD: /bin/systemctl start buildandhost-*
your-username ALL=(ALL) NOPASSWD: /bin/systemctl stop buildandhost-*
your-username ALL=(ALL) NOPASSWD: /bin/systemctl disable buildandhost-*
your-username ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
your-username ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t
your-username ALL=(ALL) NOPASSWD: /usr/bin/tee /etc/systemd/system/buildandhost-*.service
your-username ALL=(ALL) NOPASSWD: /usr/bin/tee /etc/nginx/sites-available/buildandhost-*
```

Or update the deployment_manager.py to use subprocess with sudo for those commands.

### 6. Configure Database Credentials

Update the credentials in `Backend/websiteBuilder_Backend/app/deployment_manager.py`:

```python
DB_USER = "postgres"
DB_PASSWORD = "root"  # Change this to your PostgreSQL password
DB_HOST = "localhost"
DB_PORT = "5432"
```

## How It Works

### 1. Subdomain Validation
- Only lowercase alphanumeric and hyphens
- Must start and end with alphanumeric
- Length: 1-63 characters
- Checked against existing deployments

### 2. Database Creation
Each deployment gets a unique database:
- Pattern: `buildandhost_{subdomain}`
- Example: `buildandhost_hanthar`
- Initialized with portfolio schema from `database_table.sql`

### 3. Backend Cloning
- Template: `Backend/portfolio_backend/`
- Destination: `Backend/portfolio_backend/deployments/{subdomain}/`
- Updates `database.py` with new database URL

### 4. Port Allocation
- Range: 8000-8999
- Checks database for allocated ports
- Verifies port not in use on system
- Transactional allocation prevents conflicts

### 5. Systemd Service
Service file created at: `/etc/systemd/system/buildandhost-{subdomain}.service`

Example:
```ini
[Unit]
Description=BuildAndHost Portfolio - hanthar
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/deployments/hanthar
ExecStart=/path/to/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### 6. Health Check
- Polls `http://127.0.0.1:{port}/health`
- Max 10 retries with 1-second intervals
- Ensures backend is actually running

### 7. Nginx Configuration
Config created at: `/etc/nginx/sites-available/buildandhost-{subdomain}`

Example:
```nginx
server {
    listen 80;
    server_name hanthar.onlinegif.shop;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8. Rollback on Failure
If any step fails:
- Stops and disables systemd service
- Removes Nginx configuration
- Removes backend directory
- Releases allocated port
- Logs error in deployment record

## Testing the Deployment

### 1. Start the Backend
```bash
cd Backend/websiteBuilder_Backend
source ../../venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

### 2. Start the Frontend
```bash
cd ai-website-builder
npm install
npm run dev
```

### 3. Test Deployment Flow

1. **Navigate to Deploy Page**
   - Go to `http://localhost:5173/deploy?websiteId={valid-website-id}`
   - Or from editor, click "Deploy Website"

2. **Enter Subdomain**
   - Example: `hanthar` or `myportfolio`
   - Click "Deploy Website"

3. **Monitor Progress**
   - Watch deployment status change: DEPLOYING → RUNNING
   - View live logs as they appear
   - Wait for completion (typically 30-60 seconds)

4. **Verify Deployment**
   - Check database: `SELECT * FROM deployments;`
   - Check systemd: `sudo systemctl status buildandhost-{subdomain}`
   - Check Nginx: `cat /etc/nginx/sites-available/buildandhost-{subdomain}`
   - Visit: `https://{subdomain}.onlinegif.shop`

### 4. Test Multiple Deployments
```bash
# Deploy website 1
POST /api/deployments/websites/{website-id-1}
{"subdomain": "hanthar"}

# Deploy website 2
POST /api/deployments/websites/{website-id-2}
{"subdomain": "john"}

# Verify different ports and databases
SELECT subdomain, port, database_name, status FROM deployments;
```

### 5. Test Failure Scenarios
```bash
# Try invalid subdomain
{"subdomain": "test@site"}  # Should reject

# Try duplicate subdomain
{"subdomain": "hanthar"}    # Should reject if already exists

# Try with invalid website_id
# Should return 404
```

## API Endpoints

### Deploy Website
```http
POST /api/deployments/websites/{website_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "subdomain": "hanthar"
}

Response 201:
{
  "id": "uuid",
  "website_id": "uuid",
  "subdomain": "hanthar",
  "domain": "https://hanthar.onlinegif.shop",
  "status": "DEPLOYING",
  ...
}
```

### Get Deployment Status
```http
GET /api/deployments/{deployment_id}
Authorization: Bearer {token}

Response 200:
{
  "id": "uuid",
  "status": "RUNNING",
  "port": 8000,
  "database_name": "buildandhost_hanthar",
  ...
}
```

### Get Deployment Logs
```http
GET /api/deployments/{deployment_id}/logs
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "uuid",
    "level": "INFO",
    "message": "Starting deployment process",
    "created_at": "2026-08-23T19:00:00Z"
  },
  ...
]
```

## Troubleshooting

### Deployment Fails at Database Creation
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Check credentials in deployment_manager.py
- Verify database doesn't already exist: `psql -U postgres -l`

### Deployment Fails at Port Allocation
- Check if ports in range are available: `sudo ss -tuln | grep :80`
- Verify no port conflicts in database

### Deployment Fails at Systemd Service
- Check systemd logs: `sudo journalctl -u buildandhost-{subdomain} -n 50`
- Verify service file was created: `ls /etc/systemd/system/buildandhost-*`
- Check permissions

### Deployment Fails at Health Check
- Check backend is running: `curl http://127.0.0.1:{port}/health`
- Check backend logs: `sudo journalctl -u buildandhost-{subdomain} -f`
- Verify database connection in deployed backend

### Nginx Configuration Fails
- Test Nginx config: `sudo nginx -t`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify DNS is configured for *.onlinegif.shop

## Production Considerations

### Security
- [ ] Use dedicated database user (not postgres)
- [ ] Implement rate limiting on deployment endpoint
- [ ] Add deployment quotas per user
- [ ] Validate website content before deployment
- [ ] Use proper systemd User (not www-data in production)

### Monitoring
- [ ] Set up log aggregation for deployed services
- [ ] Monitor port allocation
- [ ] Alert on deployment failures
- [ ] Track deployment metrics

### Scaling
- [ ] Implement deployment queue for high concurrency
- [ ] Add health monitoring for deployed websites
- [ ] Implement automatic SSL certificate provisioning (Let's Encrypt)
- [ ] Consider container-based deployments for better isolation

### Cleanup
- [ ] Implement deployment deletion
- [ ] Add database cleanup for old deployments
- [ ] Implement backup strategy
- [ ] Add deployment expiration policy

## Summary

The deployment system is now fully functional with:
✅ Database models and migrations
✅ Deployment manager with full orchestration
✅ API endpoints for deployment control
✅ Frontend UI with real-time status
✅ Log streaming and monitoring
✅ Automatic rollback on failure
✅ Subdomain validation and conflict prevention
✅ Port allocation management
✅ Systemd service management
✅ Nginx proxy configuration

The system follows MVP principles - it's simple, functional, and ready for testing while leaving room for production hardening.
