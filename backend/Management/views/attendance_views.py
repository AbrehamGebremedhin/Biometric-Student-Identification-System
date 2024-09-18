import json
import os
from django.shortcuts import get_list_or_404
import pandas as pd
from datetime import datetime
from Management.models import Room, Student, Course, Exam, Attendance
from Management.serializers import RoomSerializer, StudentSerializer, CourseSerializer, ExamSerializer, AttendanceSerializer
from django.http import FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from facial import FacialRecognition
from utils.report_generation import ReportGenerator

facial = FacialRecognition()


class AttendanceList(APIView):
    """
    List all attendances, or update an attendance using facial recognition.
    """

    def get(self, request):
        IsAuthenticated()
        student_id = request.query_params.get("STUDENT_ID")
        course_code = request.query_params.get("COURSE_CODE")
        exam_time = request.query_params.get("EXAM_TIME")
        room_no = request.query_params.get("ROOM_NO")

        if not student_id and not course_code and not room_no and not exam_time:
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

        if exam_time:
            attendances = attendances.filter(
                ROOM_NO__EXAM_TIME__icontains=exam_time)

        if room_no:
            attendances = attendances.filter(
                ROOM_NO__ROOM_NO__icontains=room_no)

        if not attendances.exists():
            return Response(data={"Error": "Attendance not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data)

    def patch(self, request):
        room_no = request.query_params.get("room_no")
        exam_time = request.query_params.get("exam_time")
        input_image = request.FILES.get("input_image")

        try:
            room = Room.objects.get(ROOM_NO=room_no, EXAM_TIME=exam_time)
        except Room.DoesNotExist:
            return Response(data={"Error": f"Room number: {room_no} not found"}, status=status.HTTP_404_NOT_FOUND)

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
                return Response(data={"Error": f"Student with an ID: {id} not found"}, status=status.HTTP_404_NOT_FOUND)

            student_data = json.loads(StudentSerializer(
                student).data["STUDENT_EXTRACTED_FEATURES"])

            # Extract features from the student's image
            features = facial.compare_images(
                stored_image_features_list=student_data, input_image_path=input_image.read())

            data = {}

            if features:
                data.update({"student_id": student.STUDENT_ID})
                data.update({"student_name": student.STUDENT_NAME})
                data.update({"student_batch": student.STUDENT_BATCH})

                today = datetime.today().date()

                # Save the attendance
                try:
                    course = Course.objects.get(COURSE_CODE=course_code)
                except Course.DoesNotExist:
                    return Response(data={"Error": f"Course with code: {course_code} not found"}, status=status.HTTP_404_NOT_FOUND)

                try:
                    exam = Exam.objects.get(
                        COURSE_CODE=course, EXAM_DATE=today)
                except Exam.DoesNotExist:
                    return Response(data={"Error": f"Exam for {course} not found"}, status=status.HTTP_404_NOT_FOUND)

                # Update the attendance record
                attendance = Attendance.objects.filter(
                    STUDENT_ID=student, EXAM_ID=exam, ROOM_NO=room)

                attendance.update(ATTENDANCE_STATUS=True)
                data.update({"exam": exam.COURSE_CODE.COURSE_NAME})
                data.update({"course_code": exam.COURSE_CODE.COURSE_CODE})
                data.update({"exam_time": room.EXAM_TIME})
                data.update({"room_no": room.ROOM_NO})
                data.update({"success": True})
                return Response(data=data, status=status.HTTP_202_ACCEPTED)

            if not features:
                data.update({"success": False})

                return Response(data=data, status=status.HTTP_404_NOT_FOUND)

            if features == "No valid features extracted from the input image.":
                return Response(data={"Error: No face detected in the image, please retake it again."}, status=status.HTTP_400_BAD_REQUEST)


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


class NoImageAttendance(APIView):
    """This API endpoint is used to mark attendance without facial recognition."""

    def patch(self, request):
        room_no = request.query_params.get("room_no")
        exam_time = request.query_params.get("exam_time")
        student_id = request.query_params.get("student_id")
        course_code = request.query_params.get("course_code")

        try:
            room = Room.objects.get(ROOM_NO=room_no, EXAM_TIME=exam_time)
        except Room.DoesNotExist:
            return Response(data={"Error": "Room number: {room_no} not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            student = Student.objects.get(STUDENT_ID=student_id)
        except Student.DoesNotExist:
            return Response(data={"Error": f"Student with an ID: {id} not found"}, status=status.HTTP_404_NOT_FOUND)

        today = datetime.today().date()
        # Save the attendance
        try:
            course = Course.objects.get(COURSE_CODE=course_code)
        except Course.DoesNotExist:
            return Response(data={"Error": f"Course with code: {course_code} not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            exam = Exam.objects.get(COURSE_CODE=course, EXAM_DATE=today)
        except Exam.DoesNotExist:
            return Response(data={"Error": f"Exam for {course} not found"}, status=status.HTTP_404_NOT_FOUND)

        # Update the attendance record
        attendance = Attendance.objects.filter(
            STUDENT_ID=student, EXAM_ID=exam, ROOM_NO=room)

        attendance.update(ATTENDANCE_STATUS=True)

        return Response(True, status=status.HTTP_202_ACCEPTED)


class SearchStudentWithImage(APIView):
    def get(self, request):
        input_image = request.FILES.get("input_image")

        print(input_image)

        if not input_image:
            return Response(data={"Error": "Image not found"}, status=status.HTTP_404_NOT_FOUND)

        # Filter students based on some criteria if possible
        students = Student.objects.all()

        for student in students:
            student_data = json.loads(StudentSerializer(
                student).data["STUDENT_EXTRACTED_FEATURES"])

            is_student = facial.compare_images(
                stored_image_features_list=student_data, input_image_path=input_image.read())

            if is_student:
                data = {
                    'student_id': student.STUDENT_ID,
                    'student_name': student.STUDENT_NAME,
                    'student_batch': student.STUDENT_BATCH
                }

                return Response(data=data, status=status.HTTP_202_ACCEPTED)

        return Response(data={"Error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)


class GenerateAttendanceReport(APIView):
    """This API endpoint is used to generate attendance reports based on the given criteria."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        criteria = request.query_params.get("criteria")
        value = request.query_params.get("value")
        file_type = request.query_params.get("file_type")

        report = ReportGenerator()
        file_path = report.generate_report(
            criteria, value, file_type=file_type)

        # Return the file as a downloadable response
        response = FileResponse(open(file_path, 'rb'), as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{
            os.path.basename(file_path)}"'
        return response
