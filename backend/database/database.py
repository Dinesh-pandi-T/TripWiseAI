import os
import sqlite3
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "database", "trip_planner.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "database", "schema.sql")
DATA_DIR = os.path.join(BASE_DIR, "data")

def get_db_connection():
    """Create and return a SQLite database connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize SQLite database schema and seed from CSV files if empty."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        cursor.executescript(f.read())
    conn.commit()

    seed_tables = [
        ("destinations", "destinations.csv"),
        ("attractions", "attractions.csv"),
        ("hotels", "hotels.csv"),
        ("restaurants", "restaurants.csv"),
        ("transport", "transport.csv")
    ]

    for table_name, csv_filename in seed_tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        if count == 0:
            csv_path = os.path.join(DATA_DIR, csv_filename)
            if os.path.exists(csv_path):
                df = pd.read_csv(csv_path)
                df.to_sql(table_name, conn, if_exists="append", index=False)
                print(f"[DB] Seeded {len(df)} records into '{table_name}' from {csv_filename}")

    conn.close()
    print("[DB] Database initialization complete.")

if __name__ == "__main__":
    init_db()
