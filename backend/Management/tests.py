from Management.serializers import AttendanceSerializer
from Management.models import Student, Attendance, Room, Exam, Course
from rest_framework.test import APITestCase
import json
import os
import pandas as pd
from io import BytesIO
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from Management.models import Course, Student, Exam, Room, Attendance, ExaminerMobile
from Management.serializers import CourseSerializer, AttendanceSerializer
from facial import FacialRecognition
from datetime import datetime, timedelta

facial = FacialRecognition()


class TestCourseViews(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', password='testpassword')

        # Obtain JWT token
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {
                                refresh.access_token}')

        self.course1 = Course.objects.create(
            COURSE_CODE="CS101", COURSE_NAME="Computer Science", TERM="SPRING")
        self.course2 = Course.objects.create(
            COURSE_CODE="MATH101", COURSE_NAME="Mathematics", TERM="FALL")
        self.course_list_url = reverse('course-list')
        self.course_detail_url = lambda pk: reverse('course-detail', args=[pk])

    def test_get_all_courses(self):
        response = self.client.get(self.course_list_url)
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_get_courses_with_name_filter(self):
        response = self.client.get(self.course_list_url, {
                                   'name': 'Computer Science'})
        courses = Course.objects.filter(
            COURSE_NAME__icontains='Computer Science')
        serializer = CourseSerializer(courses, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_get_courses_with_term_filter(self):
        response = self.client.get(self.course_list_url, {'term': 'SPRING'})
        courses = Course.objects.filter(TERM__icontains='SPRING')
        serializer = CourseSerializer(courses, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_create_course(self):
        data = {'COURSE_CODE': 'PHY101',
                'COURSE_NAME': 'Physics', 'TERM': 'SUMMER'}
        response = self.client.post(self.course_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.count(), 3)
        self.assertEqual(Course.objects.get(
            COURSE_CODE='PHY101').COURSE_NAME, 'Physics')

    def test_get_course_detail(self):
        response = self.client.get(self.course_detail_url(self.course1.pk))
        course = Course.objects.get(pk=self.course1.pk)
        serializer = CourseSerializer(course)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_update_course(self):
        data = {'COURSE_NAME': 'Advanced Computer Science'}
        response = self.client.patch(
            self.course_detail_url(self.course1.pk), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Course.objects.get(
            pk=self.course1.pk).COURSE_NAME, 'Advanced Computer Science')

    def test_delete_course(self):
        response = self.client.delete(self.course_detail_url(self.course1.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Course.objects.count(), 1)


# class BaseTest(APITestCase):
#     def setUp(self):
#         # Create a user and get JWT token
#         self.user = User.objects.create_user(
#             username='testuser', password='testpassword')
#         refresh = RefreshToken.for_user(self.user)
#         self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {
#                                 refresh.access_token}')
#         extracted_features = []
#         for image in ['front_image', 'left_image', 'right_image']:
#             image_file_path = f'D:\\Projects\\BSIS\\test_case_data\\{
#                 image}.jpg'
#             side = image[:-6]
#             with open(image_file_path, 'rb') as image_file:
#                 features = facial.extract_features(
#                     image_file.read(), side=side)
#                 features = features.tolist()
#                 extracted_features.append({"side": side, "features": features})

#         # Create necessary objects for testing
#         self.student = Student.objects.create(
#             STUDENT_ID='S001', STUDENT_NAME='John Doe', STUDENT_BATCH='2023', STUDENT_EXTRACTED_FEATURES=json.dumps(extracted_features))
#         self.course = Course.objects.create(
#             COURSE_CODE='CS101', COURSE_NAME='Computer Science', TERM='SPRING')
#         self.exam = Exam.objects.create(COURSE_CODE=self.course, EXAM_DATE='2023-10-10',
#                                         EXAM_TIME='10:00:00', EXAM_DURATION=120, EXAM_TYPE='FINAL')
#         self.room = Room.objects.create(ROOM_NO='R101', EXAM_TIME='MORNING', STUDENT_LIST=json.dumps([
#                                         {'students': ['S001'], 'course_code': 'CS101'}]))
#         self.attendance = Attendance.objects.create(
#             STUDENT_ID=self.student, EXAM_ID=self.exam, ROOM_NO=self.room, ATTENDANCE_STATUS=False)

#         self.attendance_list_url = reverse('attendance-list')
#         self.attendance_detail_url = reverse(
#             'attendance-detail', args=[self.attendance.pk])
#         self.no_image_attendance_url = reverse('no-image-attendance')
#         self.search_student_with_image_url = reverse(
#             'search-student-with-image')
#         self.generate_attendance_report_url = reverse(
#             'generate-attendance-report')


# class AttendanceTests(BaseTest):
#     def test_get_all_attendances(self):
#         response = self.client.get(self.attendance_list_url)
#         attendances = Attendance.objects.all()
#         serializer = AttendanceSerializer(attendances, many=True)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data, serializer.data)

#     def test_get_attendance_detail(self):
#         response = self.client.get(self.attendance_detail_url)
#         attendance = Attendance.objects.get(pk=self.attendance.pk)
#         serializer = AttendanceSerializer(attendance)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data, serializer.data)

#     def test_delete_attendance(self):
#         response = self.client.delete(self.attendance_detail_url)
#         self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
#         self.assertFalse(Attendance.objects.filter(
#             pk=self.attendance.pk).exists())

#     # def test_patch_no_image_attendance(self):
#     #     data = {
#     #         'ATTENDANCE_STATUS': True
#     #     }
#     #     response = self.client.patch(self.no_image_attendance_url, data)
#     #     self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
#     #     self.attendance.refresh_from_db()
#     #     self.assertTrue(self.attendance.ATTENDANCE_STATUS)

#     def test_search_student_with_image(self):
#         with open('D:\\Projects\\BSIS\\test_case_data\\test_image.jpg', 'rb') as image:
#             response = self.client.get(self.search_student_with_image_url, {
#                                        'input_image': image})
#         self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

#     def test_generate_attendance_report(self):
#         response = self.client.get(self.generate_attendance_report_url, {
#                                    'criteria': 'course', 'value': 'CS101', 'file_type': 'pdf'})
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertTrue(response.streaming)


class ExamTests(APITestCase):
    def setUp(self):
        self.course = Course.objects.create(
            COURSE_CODE='CS101', COURSE_NAME='Computer Science', TERM='SPRING')
        self.exam = Exam.objects.create(
            COURSE_CODE=self.course,
            EXAM_DATE=datetime.today().date() + timedelta(days=1),
            EXAM_TIME='10:00:00',
            EXAM_DURATION=120,
            EXAM_TYPE='MIDTERM'
        )
        self.list_url = reverse('exam-list')
        self.detail_url = reverse('exam-detail', args=[self.exam.pk])
        self.user = User.objects.create_user(
            username='testuser', password='testpassword')
        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {
                                self.token.access_token}')

    def test_list_exams(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_exams(self):
        response = self.client.get(
            self.list_url, {'COURSE_CODE': self.course.pk})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_exam(self):
        data = {
            'COURSE_CODE': self.course.pk,
            'EXAM_DATE': (datetime.today().date() + timedelta(days=2)).strftime('%Y-%m-%d'),
            'EXAM_TIME': '10:00:00',
            'EXAM_DURATION': 120,
            'EXAM_TYPE': 'FINAL'
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_exam(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_exam(self):
        data = {'EXAM_DURATION': 150}
        response = self.client.patch(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.exam.refresh_from_db()
        self.assertEqual(self.exam.EXAM_DURATION, 150)

    def test_delete_exam(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Exam.objects.filter(pk=self.exam.pk).exists())


class ExaminerTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='testpassword')
        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {
                                self.token.access_token}')

        self.examiner1 = ExaminerMobile.objects.create(
            EXAMINER_NAME='John Doe', EXAMINER_PHONE='1234567890', ACTIVE=True)
        self.examiner2 = ExaminerMobile.objects.create(
            EXAMINER_NAME='Jane Doe', EXAMINER_PHONE='0987654321', ACTIVE=False)

        self.list_url = reverse('examiner-list')
        self.detail_url = lambda uuid: reverse('examiner-detail', args=[uuid])
        self.active_check_url = lambda uuid: reverse(
            'examiner-active-check', args=[uuid])

    def test_list_examiners(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_add_examiner(self):
        data = {
            'EXAMINER_NAME': 'New Examiner',
            'EXAMINER_PHONE': '1122334455',
            'ACTIVE': True
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ExaminerMobile.objects.count(), 3)

    def test_retrieve_examiner(self):
        response = self.client.get(self.detail_url(self.examiner1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['EXAMINER_NAME'], 'John Doe')

    def test_update_examiner(self):
        data = {'ACTIVE': False}
        response = self.client.patch(self.detail_url(self.examiner1.id), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.examiner1.refresh_from_db()
        self.assertFalse(self.examiner1.ACTIVE)

    def test_delete_examiner(self):
        response = self.client.delete(self.detail_url(self.examiner1.id))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ExaminerMobile.objects.count(), 1)

    def test_check_examiner_active(self):
        response = self.client.get(self.active_check_url(self.examiner1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['ACTIVE'])


# class StudentTests(APITestCase):
#     def setUp(self):
#         self.user = self.setup_user()
#         self.client.credentials(
#             HTTP_AUTHORIZATION='Bearer ' + self.get_token())
#         self.student_list_url = reverse('student-list')
#         self.student_detail_url = lambda id: reverse(
#             'student-detail', args=[id])
#         self.test_data_path = 'D:\\Projects\\BSIS\\test_case_data'
#         self.student_data = {
#             "STUDENT_ID": "S12345",
#             "STUDENT_NAME": "John Doe",
#             "STUDENT_BATCH": "2023"
#         }

#     def setup_user(self):
#         from django.contrib.auth.models import User
#         return User.objects.create_user('testuser', 'test@example.com', 'testpassword')

#     def get_token(self):
#         refresh = RefreshToken.for_user(self.user)
#         return str(refresh.access_token)

#     def test_get_students(self):
#         response = self.client.get(self.student_list_url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     def test_create_student(self):
#         with open(os.path.join(self.test_data_path, 'front_image.jpg'), 'rb') as front_image, \
#                 open(os.path.join(self.test_data_path, 'left_image.jpg'), 'rb') as left_image, \
#                 open(os.path.join(self.test_data_path, 'right_image.jpg'), 'rb') as right_image:
#             data = self.student_data.copy()
#             extracted_features = []
#             for image_file in [front_image, left_image, right_image]:
#                 side = image_file[:-6]
#                 features = facial.extract_features(
#                     image_file.read(), side=side)
#                 features = features.tolist()
#                 extracted_features.append({"side": side, "features": features})
#             data.update({
#                 'STUDENT_EXTRACTED_FEATURES': json.dumps(extracted_features),
#             })
#             response = self.client.post(
#                 self.student_list_url, data, format='multipart')
#             self.assertEqual(response.status_code, status.HTTP_201_CREATED)

#     def test_get_student_detail(self):
#         student = Student.objects.create(**self.student_data)
#         response = self.client.get(self.student_detail_url(student.STUDENT_ID))
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     def test_update_student(self):
#         student = Student.objects.create(**self.student_data)
#         with open(os.path.join(self.test_data_path, 'test_image.jpg'), 'rb') as test_image:
#             data = {'front_image': test_image}
#             response = self.client.patch(self.student_detail_url(
#                 student.STUDENT_ID), data, format='multipart')
#             self.assertEqual(response.status_code, status.HTTP_200_OK)

#     def test_delete_student(self):
#         student = Student.objects.create(**self.student_data)
#         response = self.client.delete(
#             self.student_detail_url(student.STUDENT_ID))
#         self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

class RoomListTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', password='testpassword')
        self.token = RefreshToken.for_user(self.user).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.room_list_url = reverse('room-list')

    def test_get_rooms_without_filters(self):
        response = self.client.get(self.room_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_rooms_with_room_no_filter(self):
        Room.objects.create(
            ROOM_NO='101', EXAM_TIME='MORNING', STUDENT_LIST=[])
        response = self.client.get(self.room_list_url, {'room_no': '101'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_rooms_with_exam_time_filter(self):
        Room.objects.create(
            ROOM_NO='101', EXAM_TIME='MORNING', STUDENT_LIST=[])
        response = self.client.get(
            self.room_list_url, {'exam_time': 'MORNING'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_post_rooms_with_valid_csv(self):
        csv_data = "room_no,student_id,course_code,term\n101,1,CS101,SPRING"
        csv_file = BytesIO(csv_data.encode())
        csv_file.name = 'test.csv'
        response = self.client.post(
            self.room_list_url, {'file': csv_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_post_rooms_with_invalid_file_format(self):
        txt_data = "This is a text file."
        txt_file = BytesIO(txt_data.encode())
        txt_file.name = 'test.txt'
        response = self.client.post(
            self.room_list_url, {'file': txt_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_rooms_with_missing_columns(self):
        csv_data = "room_no,student_id\n101,1"
        csv_file = BytesIO(csv_data.encode())
        csv_file.name = 'test.csv'
        response = self.client.post(
            self.room_list_url, {'file': csv_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class RoomDetailTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', password='testpassword')
        self.token = RefreshToken.for_user(self.user).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.room = Room.objects.create(
            ROOM_NO='101', EXAM_TIME='MORNING', STUDENT_LIST=[])
        self.room_detail_url = reverse('room-detail', args=[self.room.ROOM_NO])

    def test_get_room_detail(self):
        response = self.client.get(self.room_detail_url, {
                                   'exam_time': 'MORNING'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_room(self):
        response = self.client.delete(self.room_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
