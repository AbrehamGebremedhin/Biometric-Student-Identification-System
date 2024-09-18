from django.urls import path
from Management.views.students_views import StudentList, StudentDetail
from Management.views.course_views import CourseList, CourseDetail
from Management.views.exam_views import ExamList, ExamDetail
from Management.views.room_views import RoomList, RoomDetail
from Management.views.attendance_views import AttendanceList, AttendanceDetail, NoImageAttendance, GenerateAttendanceReport, SearchStudentWithImage
from Management.views.mobile_views import ExaminerList, ExaminerDetail, ExaminerActiveCheck

urlpatterns = [
    path('students/', StudentList.as_view()),
    path('students/<str:id>/', StudentDetail.as_view()),
    path('searchStudent/', SearchStudentWithImage.as_view()),
    path('courses/', CourseList.as_view()),
    path('courses/<int:pk>/', CourseDetail.as_view()),
    path('exams/', ExamList.as_view()),
    path('exams/<int:pk>/', ExamDetail.as_view()),
    path('rooms/', RoomList.as_view()),
    path('rooms/<str:no>/', RoomDetail.as_view()),
    path('attendances/', AttendanceList.as_view()),
    path('attendances/<int:pk>/', AttendanceDetail.as_view()),
    path('attendances/no-image/', NoImageAttendance.as_view()),
    path('attendances/generate-report/', GenerateAttendanceReport.as_view()),
    path('examiners/', ExaminerList.as_view()),
    path('examiners/<str:uuid>/', ExaminerDetail.as_view()),
    path('check/<str:uuid>/', ExaminerActiveCheck.as_view()),
]
