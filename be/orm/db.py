import os
import django
from django.conf import settings

# Configure Django settings
if not settings.configured:
    settings.configure(
        DEBUG=True,
        DATABASES={
            # SQLite cho development (không cần cài PostgreSQL)
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': os.path.join(os.path.dirname(__file__), '..', 'db.sqlite3'),
            }
            
            # # PostgreSQL (uncomment nếu muốn dùng PostgreSQL)
            # 'default': {
            #     'ENGINE': 'django.db.backends.postgresql',
            #     'NAME': 'OCR_SYSTEM',
            #     'USER': 'postgres',
            #     'PASSWORD': 'postgresql',
            #     'HOST': 'localhost',
            #     'PORT': '5432',
            # }
        },
        INSTALLED_APPS=[
            'django.contrib.admin',
            'django.contrib.auth',
            'django.contrib.contenttypes',
            'django.contrib.sessions',
            'django.contrib.messages',
            'django.contrib.staticfiles',
            'django_extensions',
            # 'core',  # your app name
        ],
        USE_TZ=True,

        TIME_ZONE='Asia/Ho_Chi_Minh',

        LANGUAGE_CODE='vi-vn',
        # LANGUAGE_CODE='en-us',
        
    )

# Setup Django
django.setup()

# Now you can import and use your models


