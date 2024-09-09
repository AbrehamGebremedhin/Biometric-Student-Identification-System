from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from Management.models import Student
import uuid


class StudentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student_data = {
            'STUDENT_ID': "AX4879",
            'STUDENT_NAME': 'John Doe',
            'STUDENT_BATCH': '2023',
            'left_image': "D:\Projects\BSIS\\backend\Management\\test_case_data\left_image.jpg",
            'right_image': "D:\Projects\BSIS\\backend\Management\\test_case_data\\right_image.jpg",
            'front_image': "D:\Projects\BSIS\\backend\Management\\test_case_data\\front_image.jpg",
        }
        self.student = Student.objects.create(**self.student_data)
        self.valid_payload = {
            'STUDENT_ID': "AX4879",
            'STUDENT_NAME': 'John Doe',
            'STUDENT_BATCH': '2023',
            'left_image': "D:\Projects\BSIS\\backend\Management\\test_case_data\left_image.jpg",
            'right_image': "D:\Projects\BSIS\\backend\Management\\test_case_data\\right_image.jpg",
            'front_image': "D:\Projects\BSIS\\backend\Management\\test_case_data\\front_image.jpg",
        }
        self.invalid_payload = {
            'STUDENT_ID': "JX4879",
            'STUDENT_NAME': 'Jane Doe',
            'STUDENT_BATCH': '2023',
            'left_image': "D:\Projects\BSIS\\backend\Management\\test_case_data\image1.jpg",
            'right_image': "D:\Projects\BSIS\\backend\Management\\test_case_data\\image2.jpg",
            'front_image': "D:\Projects\BSIS\\backend\Management\\test_case_data\\image3.jpg",
        }

    def test_get_all_students(self):
        response = self.client.get(reverse('student-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_single_student(self):
        response = self.client.get(
            reverse('student-detail', kwargs={'id': self.student.STUDENT_ID}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_valid_student(self):
        response = self.client.post(
            reverse('student-list'),
            data=self.valid_payload,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_invalid_student(self):
        response = self.client.post(
            reverse('student-list'),
            data=self.invalid_payload,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_student(self):
        update_payload = {
            'STUDENT_NAME': 'John Smith',
            'STUDENT_BATCH': '2023',
            'STUDENT_EXTRACTED_FEATURES': {}
        }
        response = self.client.patch(
            reverse('student-detail', kwargs={'id': self.student.STUDENT_ID}),
            data=update_payload,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_student(self):
        response = self.client.delete(
            reverse('student-detail', kwargs={'id': self.student.STUDENT_ID})
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
