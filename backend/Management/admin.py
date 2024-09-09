from django.contrib import admin
from Management.models import Student, Course, Exam, Room, Attendance

# Register your models here.
admin.site.register(Student)
admin.site.register(Course)
admin.site.register(Exam)
admin.site.register(Room)
admin.site.register(Attendance)
