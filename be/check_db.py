"""
Script đơn giản để test kết nối database
"""
import os
import django
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "orm.settings")
django.setup()

from django.db import connection

def test_database_connection():
    """Test kết nối và hiển thị thông tin database"""
    try:
        with connection.cursor() as cursor:
            # Test basic connection
            cursor.execute("SELECT version()")
            version = cursor.fetchone()[0]
            print(f"✅ PostgreSQL version: {version}")
            
            # Get current database name
            cursor.execute("SELECT current_database()")
            db_name = cursor.fetchone()[0]
            print(f"✅ Database name: {db_name}")
            
            # Get current user
            cursor.execute("SELECT current_user")
            user = cursor.fetchone()[0]
            print(f"✅ Connected as: {user}")
            
            # List all tables
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """)
            tables = [row[0] for row in cursor.fetchall()]
            
            if tables:
                print(f"\n📋 Tables in database ({len(tables)} tables):")
                for table in tables:
                    print(f"  - {table}")
            else:
                print("\n⚠️ No tables found in database")
            
            return True
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing PostgreSQL Connection")
    print("=" * 50)
    
    print(f"DB_NAME: {os.getenv('DB_NAME')}")
    print(f"DB_HOST: {os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}")
    print("=" * 50)
    
    if test_database_connection():
        print("\n🎉 Database connection successful!")
    else:
        print("\n❌ Database connection failed!")
    
    print("=" * 50)