#!/usr/bin/env python3
"""
Quick fix script to generate and deploy HTML for armyranger
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database import AsyncSessionLocal
from app.models import GeneratedWebsite, Deployment
from app.static_site_generator import generate_static_html
from sqlalchemy import select


async def fix_armyranger():
    async with AsyncSessionLocal() as session:
        # Get armyranger deployment
        deployment = await session.scalar(
            select(Deployment).where(Deployment.subdomain == 'armyranger')
        )
        
        if not deployment:
            print("❌ Armyranger deployment not found")
            return False
        
        print(f"Found deployment: {deployment.id}")
        print(f"Website ID: {deployment.website_id}")
        
        # Get website JSON
        website = await session.scalar(
            select(GeneratedWebsite).where(GeneratedWebsite.id == deployment.website_id)
        )
        
        if not website:
            print("❌ Website data not found")
            return False
        
        print("✓ Website data found")
        
        # Generate HTML
        print("Generating HTML...")
        html_content = generate_static_html(website.website_json)
        print(f"✓ HTML generated ({len(html_content)} characters)")
        
        # Save to deployment directory
        deployment_dir = Path("/home/ubuntu/BuildAndHost/Backend/portfolio_backend/deployments/armyranger")
        html_file = deployment_dir / "index.html"
        
        html_file.write_text(html_content, encoding='utf-8')
        print(f"✓ Saved HTML to: {html_file}")
        
        print("\n✅ HTML generation complete!")
        print("Next: Update nginx config to serve static HTML")
        
        return True


if __name__ == "__main__":
    success = asyncio.run(fix_armyranger())
    sys.exit(0 if success else 1)
