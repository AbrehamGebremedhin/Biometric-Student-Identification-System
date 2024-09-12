from rest_framework import serializers
from Management.models import Student, Course, Exam, Room, Attendance, ExaminerMobile


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['STUDENT_ID', 'STUDENT_NAME',
                  'STUDENT_BATCH', 'STUDENT_EXTRACTED_FEATURES']


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'COURSE_CODE', 'COURSE_NAME', 'TERM']


class ExamSerializer(serializers.ModelSerializer):
    course_code = CourseSerializer(source='COURSE_CODE', read_only=True)

    class Meta:
        model = Exam
        fields = ['id', 'EXAM_DATE', 'EXAM_TIME',
                  'EXAM_DURATION', 'EXAM_TYPE', 'course_code']


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['ROOM_NO', 'EXAM_TIME', 'STUDENT_LIST']


class AttendanceSerializer(serializers.ModelSerializer):
    student_id = StudentSerializer(source='STUDENT_ID', read_only=True)
    exam_id = ExamSerializer(source='EXAM_ID', read_only=True)
    room_no = RoomSerializer(source='ROOM_NO', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'student_id', 'exam_id',
                  'room_no', 'ATTENDANCE_STATUS']


class MobileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExaminerMobile
        fields = '__all__'
