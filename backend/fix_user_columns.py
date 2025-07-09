import asyncio
from src.db.db import engine
from sqlalchemy import text

COLUMNS = [
    ("email_verification_code", "VARCHAR(6)"),
    ("email_verification_code_expires_at", "TIMESTAMP"),
    ("password_reset_code", "VARCHAR(6)"),
    ("password_reset_code_expires_at", "TIMESTAMP"),
]

async def ensure_columns():
    async with engine.begin() as conn:
        for col, coltype in COLUMNS:
            res = await conn.execute(text(
                f"SELECT column_name FROM information_schema.columns "
                f"WHERE table_name = 'users' AND column_name = '{col}'"
            ))
            if res.first() is None:
                await conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {coltype}"))
                print(f"Added column: {col}")
            else:
                print(f"Column already exists: {col}")

if __name__ == '__main__':
    asyncio.run(ensure_columns()) 