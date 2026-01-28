from models.documents import BHYT
from django.utils import timezone
from django.db import connection
from pprint import pprint

def create_bhyt(citizen, bhyt_number, issue_date, expiry_date):
    bhyt = BHYT(
        citizen=citizen,
        so_bhyt=bhyt_number,
        issue_date=issue_date,
        expiry_date=expiry_date,
        created_at=timezone.now(),
    )
    bhyt.save()
    print(connection.queries)
    return bhyt

def get_bhyt_by_number(bhyt_number):
    try:
        bhyt = BHYT.objects.get(so_bhyt=bhyt_number)
        print(connection.queries)
        return bhyt
    except BHYT.DoesNotExist:
        return None
    
def update_bhyt_expiry_date(bhyt_number, new_expiry_date):
    try:
        bhyt = BHYT.objects.get(so_bhyt=bhyt_number)
        bhyt.expiry_date = new_expiry_date
        bhyt.save()
        print(connection.queries)   
        return bhyt
    except BHYT.DoesNotExist:
        return None

def delete_bhyt(bhyt_number):
    try:
        bhyt = BHYT.objects.get(so_bhyt=bhyt_number)
        bhyt.delete()
        print(connection.queries)
        return True
    except BHYT.DoesNotExist:
        return False

