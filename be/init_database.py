"""
Tổng hợp migration - Tạo tất cả bảng database cho OCR System theo schema chuẩn
Chạy script này để khởi tạo database từ đầu
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "orm.settings")
django.setup()

from django.db import connection

def create_all_tables():
    """Tạo tất cả các bảng cần thiết cho hệ thống"""
    with connection.cursor() as cursor:
        print("🔧 Bắt đầu tạo database...")
        
        # 1. Bảng User
        print("📝 Tạo bảng ocr_core_user...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ocr_core_user (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(10) DEFAULT 'USER' NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        """)
        
        # 2. Bảng Citizens
        print("📝 Tạo bảng ocr_core_citizens...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ocr_core_citizens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name VARCHAR(255) NOT NULL,
                date_of_birth DATE,
                gender VARCHAR(10),
                nationality VARCHAR(255),
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                FOREIGN KEY (user_id) REFERENCES ocr_core_user(id) ON DELETE CASCADE
            )
        """)
        
        # 3. Bảng Documents
        print("📝 Tạo bảng ocr_core_documents...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ocr_core_documents (
                id SERIAL PRIMARY KEY,
                citizen_id INTEGER NOT NULL,
                type VARCHAR(50) NOT NULL,
                status VARCHAR(20) NOT NULL,
                issue_date DATE NOT NULL,
                expire_date DATE NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                FOREIGN KEY (citizen_id) REFERENCES ocr_core_citizens(id) ON DELETE CASCADE
            )
        """)
        
        # 4. Bảng CCCD (OneToOne với Documents)
        print("📝 Tạo bảng ocr_core_cccd...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ocr_core_cccd (
                document_id INTEGER PRIMARY KEY,
                so_cccd VARCHAR(12) UNIQUE NOT NULL,
                origin_place VARCHAR(255) NOT NULL,
                current_place VARCHAR(255) NOT NULL,
                FOREIGN KEY (document_id) REFERENCES ocr_core_documents(id) ON DELETE CASCADE
            )
        """)
        
        # 5. Bảng BHYT (OneToOne với Documents)
        print("📝 Tạo bảng ocr_core_bhyt...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ocr_core_bhyt (
                document_id INTEGER PRIMARY KEY,
                so_bhyt VARCHAR(15) UNIQUE NOT NULL,
                hospital_code VARCHAR(100) NOT NULL,
                insurance_area VARCHAR(255) NOT NULL,
                FOREIGN KEY (document_id) REFERENCES ocr_core_documents(id) ON DELETE CASCADE
            )
        """)
        
        # 6. Bảng GPLX (OneToOne với Documents)
        print("📝 Tạo bảng ocr_core_gplx...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ocr_core_gplx (
                document_id INTEGER PRIMARY KEY,
                so_gplx VARCHAR(15) UNIQUE NOT NULL,
                hang_gplx VARCHAR(10) NOT NULL,
                noi_cap VARCHAR(255) NOT NULL,
                FOREIGN KEY (document_id) REFERENCES ocr_core_documents(id) ON DELETE CASCADE
            )
        """)
        
        # 7. Bảng DocumentImages
        print("📝 Tạo bảng ocr_core_documentimages...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ocr_core_documentimages (
                id SERIAL PRIMARY KEY,
                document_id INTEGER NOT NULL,
                image_path VARCHAR(500) NOT NULL,
                side VARCHAR(10) NOT NULL,
                uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
                FOREIGN KEY (document_id) REFERENCES ocr_core_documents(id) ON DELETE CASCADE
            )
        """)
        
        # 8. Bảng OCR_Jobs
        print("📝 Tạo bảng ocr_core_ocr_jobs...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ocr_core_ocr_jobs (
                id SERIAL PRIMARY KEY,
                document_id INTEGER NOT NULL,
                status VARCHAR(50) NOT NULL,
                model_name VARCHAR(100) NOT NULL,
                model_version VARCHAR(50) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                finished_at TIMESTAMP,
                FOREIGN KEY (document_id) REFERENCES ocr_core_documents(id) ON DELETE CASCADE
            )
        """)
        
        # 9. Bảng OCR_Results
        print("📝 Tạo bảng ocr_core_ocr_results...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ocr_core_ocr_results (
                id SERIAL PRIMARY KEY,
                ocr_job_id INTEGER NOT NULL,
                field_name VARCHAR(255) NOT NULL,
                raw_text TEXT NOT NULL,
                confidence DECIMAL(4,2),
                bounding_box TEXT,
                FOREIGN KEY (ocr_job_id) REFERENCES ocr_core_ocr_jobs(id) ON DELETE CASCADE
            )
        """)
        
        print("\n✅ Tạo tất cả bảng thành công!")
        print("\n📊 Danh sách các bảng đã tạo:")
        print("   1. ocr_core_user - Quản lý người dùng (có role)")
        print("   2. ocr_core_citizens - Thông tin công dân (có user_id)")
        print("   3. ocr_core_documents - Quản lý giấy tờ")
        print("   4. ocr_core_cccd - Chi tiết CCCD (OneToOne với Documents)")
        print("   5. ocr_core_bhyt - Chi tiết BHYT (OneToOne với Documents)")
        print("   6. ocr_core_gplx - Chi tiết GPLX (OneToOne với Documents)")
        print("   7. ocr_core_documentimages - Ảnh giấy tờ")
        print("   8. ocr_core_ocr_jobs - Công việc OCR")
        print("   9. ocr_core_ocr_results - Kết quả OCR")

def create_admin_user():
    """Tạo tài khoản admin mặc định"""
    from orm.models.user import User
    from api.core.security import get_password_hash
    
    print("\n👤 Tạo tài khoản admin...")
    try:
        # Xóa admin cũ nếu có
        User.objects.filter(email='admin@gmail.com').delete()
        
        # Tạo admin mới với role ADMIN
        hashed_password = get_password_hash('123456')
        admin_user = User.objects.create(
            username='admin@gmail.com',
            email='admin@gmail.com',
            password=hashed_password,
            role='ADMIN'
        )
        
        print("✅ Tạo tài khoản admin thành công!")
        print(f"   Email: admin@gmail.com")
        print(f"   Password: 123456")
        print(f"   Role: ADMIN")
        print(f"   User ID: {admin_user.id}")
        
    except Exception as e:
        print(f"⚠️  Lỗi khi tạo admin: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 OCR SYSTEM - DATABASE INITIALIZATION")
    print("=" * 60)
    
    create_all_tables()
    create_admin_user()
    
    print("\n" + "=" * 60)
    print("🎉 Hoàn thành! Database đã sẵn sàng sử dụng")
    print("=" * 60)
