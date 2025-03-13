from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import CustomUser

@shared_task
def delete_unverified_accounts():
    """Deletes unverified accounts older than 24 hours."""
    time_threshold = timezone.now() - timedelta(days=1)  # 24 hours
    unverified_users = CustomUser.objects.filter(
        is_email_verified=False,
        is_phone_verified=False,
        date_joined__lte=time_threshold,
    )
    deleted_count = unverified_users.count()
    unverified_users.delete()
    print(f"Deleted {deleted_count} unverified accounts.")