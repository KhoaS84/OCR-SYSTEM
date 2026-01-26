import sqlite3
import json
from datetime import datetime

def view_database():
    """View all data in the SQLite database"""
    conn = sqlite3.connect('db.sqlite3')
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [row[0] for row in cursor.fetchall()]
    
    print("=" * 80)
    print("DATABASE CONTENTS")
    print("=" * 80)
    
    for table_name in tables:
        print(f"\n📋 Table: {table_name}")
        print("-" * 80)
        
        # Get table structure
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"Columns: {', '.join(columns)}")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"Total rows: {count}")
        
        # Get all data
        if count > 0:
            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()
            
            print("\nData:")
            for i, row in enumerate(rows, 1):
                print(f"\n  Row {i}:")
                for key in row.keys():
                    value = row[key]
                    # Format datetime if needed
                    if isinstance(value, str) and ('created_at' in key or 'updated_at' in key):
                        try:
                            dt = datetime.fromisoformat(value)
                            value = dt.strftime('%Y-%m-%d %H:%M:%S')
                        except:
                            pass
                    print(f"    {key}: {value}")
        else:
            print("  (No data)")
    
    conn.close()
    print("\n" + "=" * 80)

if __name__ == "__main__":
    view_database()
