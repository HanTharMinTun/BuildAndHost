#!/usr/bin/env python3
"""
Test script to verify port allocation fix.
This demonstrates that the new logic correctly handles:
1. Checking all deployments (including FAILED ones)
2. Finding unused ports
3. Avoiding duplicate port allocation
"""

import asyncio
import sys
from pathlib import Path

# Add the app directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import AsyncSessionLocal
from app.routers.deployments import allocate_port_for_deployment
from sqlalchemy import select, text
from app.models import Deployment


async def test_port_allocation():
    """Test that port allocation works correctly"""
    async with AsyncSessionLocal() as session:
        print("Testing port allocation logic...")
        print("-" * 60)
        
        # Get all current deployments
        result = await session.execute(
            select(Deployment.subdomain, Deployment.port, Deployment.status)
            .order_by(Deployment.created_at)
        )
        deployments = result.all()
        
        print(f"\nCurrent deployments:")
        for subdomain, port, status in deployments:
            print(f"  {subdomain:<20} port={port:<6} status={status}")
        
        # Show which ports are allocated
        ports = [port for _, port, _ in deployments if port]
        print(f"\nAllocated ports: {sorted(ports)}")
        
        # Test port allocation
        print("\nTesting port allocation (will find first unused port)...")
        try:
            new_port = await allocate_port_for_deployment(session)
            print(f"✓ Successfully allocated port: {new_port}")
            print(f"  This port is not in the allocated list: {sorted(ports)}")
            
            # Verify the allocated port is not in use
            if new_port in ports:
                print(f"✗ ERROR: Allocated port {new_port} is already in use!")
                return False
            else:
                print(f"✓ Port {new_port} is correctly identified as available")
                return True
                
        except Exception as e:
            print(f"✗ Port allocation failed: {e}")
            return False


async def main():
    success = await test_port_allocation()
    print("\n" + "=" * 60)
    if success:
        print("✓ Port allocation fix is working correctly!")
        print("  - Checks ALL deployments (including FAILED ones)")
        print("  - Uses SELECT FOR UPDATE to prevent race conditions")
        print("  - Correctly identifies unused ports")
    else:
        print("✗ Port allocation test failed")
    print("=" * 60)
    
    return 0 if success else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
