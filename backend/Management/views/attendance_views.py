import json
from django.shortcuts import get_list_or_404
import pandas as pd
from datetime import datetime
from Management.models import Room, Student, Course, Exam, Attendance
from Management.serializers import RoomSerializer, StudentSerializer, CourseSerializer, ExamSerializer, AttendanceSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from facial import FacialRecognition

facial = FacialRecognition()


class AttendanceList(APIView):
    """
    List all attendances, or add a new attendance.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student_id = request.query_params.get("STUDENT_ID")
        course_code = request.query_params.get("COURSE_CODE")
        room_no = request.query_params.get("ROOM_NO")

        if not student_id and not course_code and not room_no:
            attendances = Attendance.objects.all()
            serializer = AttendanceSerializer(attendances, many=True)
            return Response(serializer.data)

        attendances = Attendance.objects.all()

        if student_id:
            attendances = attendances.filter(
                STUDENT_ID__STUDENT_ID__icontains=student_id)

        if course_code:
            attendances = attendances.filter(
                EXAM_ID__COURSE_CODE__COURSE_CODE__icontains=course_code)

        if room_no:
            attendances = attendances.filter(
                ROOM_NO__ROOM_NO__icontains=room_no)

        if not attendances.exists():
            return Response({"error": "Attendance not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data)

    def post(self, request):
        room_no = request.query_params.get("room_no")
        exam_time = request.query_params.get("exam_time")
        input_image = request.FILES.get("input_image")

        try:
            room = Room.objects.get(ROOM_NO=room_no, EXAM_TIME=exam_time)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

        # Flatten the list of student IDs
        student_ids = [
            (student_id, student["course_code"])
            for student in room.STUDENT_LIST
            for student_id in student.get("students", [])
        ]

        for id, course_code in student_ids:
            try:
                student = Student.objects.get(STUDENT_ID=id)
            except Student.DoesNotExist:
                return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
            student_data = json.loads(StudentSerializer(
                student).data["STUDENT_EXTRACTED_FEATURES"])
            # Extract features from the student's image
            features = facial.compare_images(
                stored_image_features_list=student_data, input_image_path=input_image.read())

            if features:
                today = datetime.today().date()
                # Save the attendance
                exam = Exam.objects.get(
                    COURSE_CODE=course_code, EXAM_DATE=today)
                attendance = Attendance(
                    STUDENT_ID=student, EXAM_ID=exam, ROOM_NO=room, ATTENDANCE_STATUS=True)

                serializer = AttendanceSerializer(attendance)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttendanceDetail(APIView):
    """
    Retrieve or delete an attendance instance.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Attendance.objects.get(pk)
        except Exam.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        attendance = self.get_object(pk)
        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data)

    def delete(self, request, pk):
        attendance = self.get_object(pk)
        attendance.delete()
        return Response(data={True}, status=status.HTTP_204_NO_CONTENT)
