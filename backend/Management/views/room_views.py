import os
import shutil
import zipfile
from io import BytesIO
import pandas as pd
from Management.models import Attendance, Room, Course, Exam, Student
from Management.serializers import RoomSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse
from utils.report_generation import ReportGenerator


class RoomList(APIView):
    def get(self, request):
        room_no = request.query_params.get('room_no')
        exam_time = request.query_params.get('exam_time')

        rooms = Room.objects.all()

        if not room_no and not exam_time:
            serializer = RoomSerializer(rooms, many=True)
            return Response(serializer.data)

        if room_no:
            rooms = rooms.filter(ROOM_NO__icontains=room_no)

        if exam_time:
            rooms = rooms.filter(EXAM_TIME__icontains=exam_time)

        if not rooms.exists():
            return Response(data={"Error": f"Room {room_no} not found at {exam_time}"}, status=status.HTTP_404_NOT_FOUND)

        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    def post(self, request):
        file = request.FILES.get('file')
        if file.name.endswith('.csv'):
            data = pd.read_csv(file)
        elif file.name.endswith('.xlsx') or file.name.endswith('.xls'):
            data = pd.read_excel(file)
        else:
            return Response(data={"Error": f"Unsupported file format"}, status=status.HTTP_400_BAD_REQUEST)

        # Required columns
        required_columns = {'room_no', 'student_id', 'course_code', 'term'}

        # Check if all required columns are present
        if not required_columns.issubset(data.columns):
            missing_columns = required_columns - set(data.columns)
            return Response(data={"Error": f"Missing columns: {', '.join(missing_columns)}"}, status=status.HTTP_400_BAD_REQUEST)

        term = data['term'].iloc[0] if 'term' in data.columns else 'Unknown Term'
        unique_room_nos = data['room_no'].unique()
        room_data = []

        for room_no in unique_room_nos:
            students = []
            course_codes = data[data['room_no'] ==
                                room_no]['course_code'].unique()

            for course_code in course_codes:
                course = Course.objects.filter(
                    COURSE_CODE=course_code, TERM=term).first()
                if not course:
                    return Response(data={"Error": f"Course {course_code} in {term} does not exist"}, status=status.HTTP_400_BAD_REQUEST)
                exam = Exam.objects.filter(COURSE_CODE=course).first()

                if not exam:
                    return Response(data={"Error": f"Exam {course_code} in {term} does not exist"}, status=status.HTTP_400_BAD_REQUEST)

                exam_type = exam.EXAM_TYPE

                student_ids = data[(data['room_no'] == room_no) & (
                    data['course_code'] == course_code)]['student_id'].unique().tolist()

                for student_id in student_ids:
                    try:
                        Student.objects.get(STUDENT_ID=student_id)
                    except Student.DoesNotExist:
                        return Response(data={"Error": f"Student with the ID: {student_id} does not exist"}, status=status.HTTP_400_BAD_REQUEST)

                students.append({
                    "course_code": course_code,
                    "students": list(student_ids)
                })

            room_data.append({
                "ROOM_NO": room_no,
                "EXAM_TIME": request.data.get("EXAM_TIME"),
                "STUDENT_LIST": students
            })

        serializer = RoomSerializer(data=room_data, many=True)

        if serializer.is_valid():
            serializer.save()
            report = ReportGenerator()
            # Create the word files and get the output directory
            output_dir = report.create_word_files(room_data, term, exam_type)

            print(output_dir)

            for room in room_data:
                room_instance = Room.objects.get(ROOM_NO=room['ROOM_NO'])
                for course_info in room['STUDENT_LIST']:
                    course_code = course_info['course_code']
                    course = Course.objects.get(
                        COURSE_CODE=course_code, TERM=term)
                    exam = Exam.objects.filter(COURSE_CODE=course).first()

                    for student_id in course_info['students']:
                        student = Student.objects.get(STUDENT_ID=student_id)

                        # Create attendance for each student in the room and exam with default false status
                        Attendance.objects.create(
                            STUDENT_ID=student,
                            EXAM_ID=exam,
                            ROOM_NO=room_instance,
                            ATTENDANCE_STATUS=False
                        )

            # Zip the output directory
            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
                for file_path in output_dir:
                    zip_file.write(file_path, os.path.relpath(
                        file_path, os.path.dirname(output_dir[0])))

            # Set buffer position to the start
            zip_buffer.seek(0)

            # Clean the output directory
            for file_path in output_dir:
                os.remove(file_path)

            # Return the zip file as a response
            return FileResponse(zip_buffer, as_attachment=True, filename=f"{term}_{exam_type}_{exam.EXAM_TIME}.zip")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoomDetail(APIView):
    """
    Retrieve, update or delete an exam instance.
    """

    def get_object(self, no, exam_time):
        try:
            return Room.objects.get(ROOM_NO=no, EXAM_TIME=exam_time)
        except Room.DoesNotExist:
            raise Http404

    def get(self, request, no):
        exam_time = request.query_params.get('exam_time')
        room = self.get_object(no, exam_time)
        data = []

        for students in room.STUDENT_LIST:
            for student in students['students']:
                student_data = Student.objects.get(STUDENT_ID=student)
                data.append({
                    "student_id": student_data.STUDENT_ID,
                    "student_name": student_data.STUDENT_NAME,
                    "student_batch": student_data.STUDENT_BATCH,
                    "takes": students['course_code']
                })

        return Response(data, status=status.HTTP_200_OK)

    def delete(self, request, no):
        room = self.get_object(no)
        room.delete()
        return Response(data={True}, status=status.HTTP_204_NO_CONTENT)
