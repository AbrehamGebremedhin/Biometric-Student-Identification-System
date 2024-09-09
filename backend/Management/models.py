import uuid
from django.db import models

# Create your models here.


class Student(models.Model):
    STUDENT_ID = models.CharField(primary_key=True, unique=True)
    STUDENT_NAME = models.CharField(max_length=100)
    STUDENT_BATCH = models.CharField(max_length=8)
    STUDENT_EXTRACTED_FEATURES = models.JSONField()

    def __str__(self):
        return f"{self.STUDENT_NAME}_{self.STUDENT_ID}"


class Course(models.Model):
    COURSE_CODE = models.CharField()
    COURSE_NAME = models.CharField(max_length=100)
    TERM = models.CharField(max_length=25, default="SPRING")

    def __str__(self):
        return f"{self.COURSE_NAME}_{self.COURSE_CODE}_{self.TERM}"


class Exam(models.Model):
    class ExamType(models.TextChoices):
        MIDTERM = 'MIDTERM', 'Midterm'
        FINAL = 'FINAL', 'Final'

    COURSE_CODE = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='exams')
    EXAM_DATE = models.DateField()
    EXAM_TIME = models.TimeField()
    EXAM_DURATION = models.IntegerField()
    EXAM_TYPE = models.CharField(max_length=50, choices=ExamType.choices)

    def __str__(self):
        return f"{self.COURSE_CODE.TERM}_{self.COURSE_CODE.COURSE_CODE}_{self.EXAM_TYPE}"


class Room(models.Model):
    class ExamTime(models.TextChoices):
        MORNING = 'MORNING', 'Morning'
        MIDDAY = 'MIDDAY', 'Midday'
        AFTERNOON = 'AFTERNOON', 'Afternoon'
    ROOM_NO = models.CharField()
    EXAM_TIME = models.CharField(max_length=50, choices=ExamTime.choices)
    STUDENT_LIST = models.JSONField()

    def __str__(self):
        return f"{self.ROOM_NO}_{self.EXAM_TIME}"


class Attendance(models.Model):
    STUDENT_ID = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='attendances')
    EXAM_ID = models.ForeignKey(
        Exam, on_delete=models.CASCADE, related_name='attendances')
    ROOM_NO = models.ForeignKey(
        Room, on_delete=models.CASCADE, related_name='attendances')
    ATTENDANCE_STATUS = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.STUDENT_ID}_{self.EXAM_ID}_{self.ROOM_NO}"


class ExaminerMobile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    EXAMINER_NAME = models.CharField(max_length=100)
    EXAMINER_PHONE = models.CharField(max_length=13)
    ACTIVE = models.BooleanField(default=True)
