"""
Migration: Add theme_json column to generated_websites table

This migration adds a theme_json JSONB column to store theme CSS configuration
for each generated website, enabling proper styling on published sites.

Usage:
    python migrations/add_theme_json_column.py
"""

import psycopg2
import os
from pathlib import Path

# Database configuration
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "websiteBuilder")


def run_migration():
    """Add theme_json column to generated_websites table"""
    
    try:
        # Connect to database
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.autocommit = False
        cursor = conn.cursor()
        
        print(f"Connected to database: {DB_NAME}")
        
        # Check if column already exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='generated_websites' 
            AND column_name='theme_json'
        """)
        
        if cursor.fetchone():
            print("✓ Column 'theme_json' already exists in 'generated_websites' table")
            cursor.close()
            conn.close()
            return True
        
        print("Adding 'theme_json' column to 'generated_websites' table...")
        
        # Add the theme_json column
        cursor.execute("""
            ALTER TABLE generated_websites 
            ADD COLUMN theme_json JSONB DEFAULT NULL
        """)
        
        # Commit the transaction
        conn.commit()
        print("✓ Successfully added 'theme_json' column")
        
        # Verify the column was added
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name='generated_websites' 
            AND column_name='theme_json'
        """)
        
        result = cursor.fetchone()
        if result:
            print(f"✓ Verified: {result[0]} ({result[1]}, nullable: {result[2]})")
        
        cursor.close()
        conn.close()
        
        print("\n✓ Migration completed successfully!")
        return True
        
    except psycopg2.Error as e:
        print(f"✗ Database error: {e}")
        if conn:
            conn.rollback()
        return False
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
        
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Database Migration: Add theme_json column")
    print("=" * 60)
    print()
    
    success = run_migration()
    
    if success:
        print("\n" + "=" * 60)
        print("Migration completed successfully!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("Migration failed!")
        print("=" * 60)
        exit(1)
