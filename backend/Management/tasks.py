from background_task import background
from .models import Room
from datetime import datetime, timedelta
from background_task.models import Task


@background(schedule=60)  # Initial delay of 60 seconds for the first run
def clear_rooms():
    Room.objects.all().delete()


def schedule_clear_rooms_task():
    now = datetime.now()
    next_run = datetime.combine(
        now.date() + timedelta(days=1), datetime.min.time()) + timedelta(hours=6)
    clear_rooms(repeat=Task.DAILY, schedule=next_run)
