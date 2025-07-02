import asyncio
import json
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import async_sessionmaker
from src.db.db import engine
from src.models.sites import Site
from src.users.models import User  # Import User model to resolve relationship

async def check_and_update_content_details():
    """Check and update content_details for existing sites"""
    Session = async_sessionmaker(engine)
    
    async with Session() as session:
        # Check sites with missing or empty content_details
        result = await session.execute(
            select(Site).where(Site.content_details.is_(None))
        )
        sites_without_content = result.scalars().all()
        
        print(f"Found {len(sites_without_content)} sites without content_details")
        
        # Update sites with default content_details
        for site in sites_without_content:
            default_content = {
                "event_title": site.title,
                "description": "Детали события",
                "contact_name": "",
                "contact_email": "",
                "contact_phone": "",
                "event_date": "",
                "event_time": "",
                "venue_name": "",
                "venue_address": "",
                "additional_info": ""
            }
            
            site.content_details = default_content
            print(f"Updated site: {site.title}")
        
        await session.commit()
        print("All sites updated successfully!")

        # Check total count
        result = await session.execute(select(Site))
        all_sites = result.scalars().all()
        print(f"\nTotal sites: {len(all_sites)}")
        
        for site in all_sites[:3]:  # Show first 3
            print(f"Site: {site.title}")
            print(f"Content details: {site.content_details}")
            print("---")

if __name__ == "__main__":
    asyncio.run(check_and_update_content_details()) 