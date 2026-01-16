from models.user import User
from models.citizens import Citizens
from models.documents import Documents, CCCD, BHYT, DocumentImages
from models.ocr import ocr_jobs, ocr_results
from django.utils import timezone
from django.db import connection
from pprint import pprint