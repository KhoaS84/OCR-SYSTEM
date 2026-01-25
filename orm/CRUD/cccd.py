from models.documents import CCCD
from django.utils import timezone
from django.db import connection
from pprint import pprint

def create_cccd(document, cccd_number, origin_place, current_place):
    cccd = CCCD(
        document=document,
        so_cccd=cccd_number,
        origin_place=origin_place,
        current_place=current_place,
        created_at=timezone.now(),
    )
    cccd.save()
    print(connection.queries)
    return cccd

def get_cccd_by_id(cccd_number):
    try:
        cccd = CCCD.objects.get(so_cccd=cccd_number)
        print(connection.queries)
        return cccd
    except CCCD.DoesNotExist:
        return None
    
def update_cccd_issue_date(cccd_number, new_issue_date, new_expiry_date):
    try:
        cccd = CCCD.objects.get(so_cccd=cccd_number)
        cccd.issue_date = new_issue_date
        cccd.expiry_date = new_expiry_date
        cccd.save()
        print(connection.queries)   
        return cccd
    except CCCD.DoesNotExist:
        return None

def delete_cccd(cccd_number):
    try:
        cccd = CCCD.objects.get(so_cccd=cccd_number)
        cccd.delete()
        print(connection.queries)
        return True
    except CCCD.DoesNotExist:
        return False