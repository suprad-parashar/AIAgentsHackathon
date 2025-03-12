from databases import Database
import os
from dotenv import load_dotenv

load_dotenv()

username = os.getenv("POSTGRES_USER")
password = os.getenv("POSTGRES_PASSWORD")
database = os.getenv("POSTGRES_DB")
DATABASE_URL = f"postgresql://{username}:{password}@localhost/{database}"

database = Database(DATABASE_URL)