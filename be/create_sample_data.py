"""
Tạo dữ liệu mẫu để test web
"""
import os
import django
from datetime import date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "orm.settings")
django.setup()

from orm.models.user import User
from orm.models.citizens import Citizens

def create_sample_data():
    """Tạo dữ liệu mẫu"""
    print("🔧 Tạo dữ liệu mẫu...")
    
    try:
        # Lấy admin user
        admin = User.objects.get(email='admin@gmail.com')
        print(f"✅ Tìm thấy admin user: {admin.username}")
        
        # Tạo một số citizens mẫu
        sample_citizens = [
            {
                'user_id': admin.id,
                'name': 'Nguyễn Văn A',
                'date_of_birth': date(1990, 1, 15),
                'gender': 'MALE',
                'nationality': 'Việt Nam'
            },
            {
                'user_id': admin.id,
                'name': 'Trần Thị B',
                'date_of_birth': date(1995, 5, 20),
                'gender': 'FEMALE',
                'nationality': 'Việt Nam'
            },
            {
                'user_id': admin.id,
                'name': 'Lê Văn C',
                'date_of_birth': date(1988, 12, 10),
                'gender': 'MALE',
                'nationality': 'Việt Nam'
            },
            {
                'user_id': admin.id,
                'name': 'Phạm Thị D',
                'date_of_birth': date(1992, 7, 25),
                'gender': 'FEMALE',
                'nationality': 'Việt Nam'
            },
        ]
        
        # Xóa citizens cũ nếu có
        Citizens.objects.filter(user_id=admin.id).delete()
        
        # Tạo citizens mới
        for citizen_data in sample_citizens:
            citizen = Citizens.objects.create(**citizen_data)
            print(f"✅ Đã tạo: {citizen.name} - ID: {citizen.id}")
        
        print(f"\n🎉 Hoàn thành! Đã tạo {len(sample_citizens)} citizens mẫu")
        
    except User.DoesNotExist:
        print("❌ Không tìm thấy admin user. Vui lòng chạy init_database.py trước")
    except Exception as e:
        print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    create_sample_data()
