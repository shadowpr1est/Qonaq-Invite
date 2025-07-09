import asyncio
from src.db.db import engine
from sqlalchemy import text

async def ensure_is_admin_column():
    async with engine.begin() as conn:
        # Check if column exists
        res = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'is_admin'
        """))
        exists = res.first() is not None
        if exists:
            print('is_admin column already exists')
        else:
            await conn.execute(text('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL'))
            print('is_admin column added')

if __name__ == '__main__':
    asyncio.run(ensure_is_admin_column()) 