from models.citizens import Citizens
from django.utils import timezone
from django.db import connection
from pprint import pprint

def create_citizen(full_name, date_of_birth, gender, nationality, created_at):
    citizen = Citizens(
        name=full_name,
        date_of_birth=date_of_birth,
        gender=gender,
        nationality=nationality,
        created_at=timezone.now(),
    )
    citizen.save()
    print(connection.queries)
    return citizen

def get_citizen_by_id(citizen_id):
    try:
        citizen = Citizens.objects.get(id=citizen_id)
        print(connection.queries)
        return citizen
    except Citizens.DoesNotExist:
        return None
    
def update_citizen_nationality(citizen_id, new_nationality):
    try:
        citizen = Citizens.objects.get(id=citizen_id)
        citizen.nationality = new_nationality
        citizen.save()
        print(connection.queries)
        return citizen
    except Citizens.DoesNotExist:
        return None
    
def delete_citizen(citizen_id):
    try:
        citizen = Citizens.objects.get(id=citizen_id)
        citizen.delete()
        print(connection.queries)
        return True
    except Citizens.DoesNotExist:

        return False
