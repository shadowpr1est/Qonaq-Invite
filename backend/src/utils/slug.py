import re
from typing import List

def generate_slug(title: str, existing_slugs: List[str] = None) -> str:
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug).strip('-')
    if existing_slugs:
        original = slug
        counter = 1
        while slug in existing_slugs:
            slug = f"{original}-{counter}"
            counter += 1
    return slug 