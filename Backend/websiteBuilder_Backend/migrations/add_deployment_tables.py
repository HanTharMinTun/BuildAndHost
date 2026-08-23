"""
Database migration to add deployment tables

Run this with:
cd Backend/websiteBuilder_Backend
python -m alembic revision --autogenerate -m "Add deployment tables"
python -m alembic upgrade head

Or manually execute this SQL in your PostgreSQL database.
"""

CREATE_DEPLOYMENTS_TABLE = """
CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL REFERENCES generated_websites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(255) NOT NULL,
    database_name VARCHAR(100) NOT NULL,
    port INTEGER NOT NULL UNIQUE,
    systemd_service VARCHAR(100) NOT NULL,
    backend_path VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DEPLOYING',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deployments_website_id ON deployments(website_id);
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_subdomain ON deployments(subdomain);
CREATE INDEX IF NOT EXISTS idx_deployments_port ON deployments(port);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
"""

CREATE_DEPLOYMENT_LOGS_TABLE = """
CREATE TABLE IF NOT EXISTS deployment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    level VARCHAR(20) NOT NULL DEFAULT 'INFO',
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment_id ON deployment_logs(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_created_at ON deployment_logs(created_at);
"""

# For automatic timestamp updates
CREATE_TRIGGER = """
CREATE OR REPLACE FUNCTION update_deployment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deployment_updated_at_trigger
    BEFORE UPDATE ON deployments
    FOR EACH ROW
    EXECUTE FUNCTION update_deployment_updated_at();
"""


if __name__ == "__main__":
    import psycopg2
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:root@localhost:5432/websiteBuilder")
    
    # Convert asyncpg URL to psycopg2 URL
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    
    print("Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    print("Creating deployments table...")
    cursor.execute(CREATE_DEPLOYMENTS_TABLE)
    
    print("Creating deployment_logs table...")
    cursor.execute(CREATE_DEPLOYMENT_LOGS_TABLE)
    
    print("Creating triggers...")
    cursor.execute(CREATE_TRIGGER)
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print("Migration completed successfully!")
