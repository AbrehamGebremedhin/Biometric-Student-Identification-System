from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .tasks import schedule_clear_rooms_task


@receiver(post_migrate)
def schedule_tasks(sender, **kwargs):
    if sender.name == 'Management':
        schedule_clear_rooms_task()
