from django.urls import path
from Management.views.students_views import StudentList, StudentDetail
from Management.views.course_views import CourseList, CourseDetail
from Management.views.exam_views import ExamList, ExamDetail
from Management.views.room_views import RoomList, RoomDetail
from Management.views.attendance_views import AttendanceList, AttendanceDetail, NoImageAttendance, GenerateAttendanceReport, SearchStudentWithImage
from Management.views.mobile_views import ExaminerList, ExaminerDetail, ExaminerActiveCheck

urlpatterns = [
    path('students/', StudentList.as_view(), name='student-list'),
    path('students/<str:id>/', StudentDetail.as_view(), name='student-detail'),
    path('searchStudent/', SearchStudentWithImage.as_view(),
         name='search-student-with-image'),
    path('courses/', CourseList.as_view(), name='course-list'),
    path('courses/<int:pk>/', CourseDetail.as_view(), name='course-detail'),
    path('exams/', ExamList.as_view(), name='exam-list'),
    path('exams/<int:pk>/', ExamDetail.as_view(), name='exam-detail'),
    path('rooms/', RoomList.as_view(), name='room-list'),
    path('rooms/<str:no>/', RoomDetail.as_view(), name='room-detail'),
    path('attendances/', AttendanceList.as_view(), name='attendance-list'),
    path('attendances/<int:pk>/', AttendanceDetail.as_view(),
         name='attendance-detail'),
    path('attendances/no-image/', NoImageAttendance.as_view(),
         name='no-image-attendance'),
    path('attendances/generate-report/',
         GenerateAttendanceReport.as_view(), name='generate-attendance-report'),
    path('examiners/', ExaminerList.as_view(), name='examiner-list'),
    path('examiners/<str:uuid>/', ExaminerDetail.as_view(), name='examiner-detail'),
    path('check/<str:uuid>/', ExaminerActiveCheck.as_view(),
         name='examiner-active-check'),
]
