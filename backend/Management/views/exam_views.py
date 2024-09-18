from datetime import datetime
from Management.models import Exam, Course
from Management.serializers import ExamSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


class ExamList(APIView):
    """
    List all exams, or add a new exam.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        course_name = request.query_params.get("name")
        course_term = request.query_params.get("term")
        exam_type = request.query_params.get("type")
        exam_date = request.query_params.get("exam_date")

        if not course_name and not course_term and not exam_type and not exam_date:
            exams = Exam.objects.all()
            serializer = ExamSerializer(exams, many=True)
            return Response(serializer.data)

        exams = Exam.objects.all()

        if course_name:
            exams = exams.filter(course__name__icontains=course_name)

        if course_term:
            exams = exams.filter(course_term__icontains=course_term)

        if exam_type:
            exams = exams.filter(EXAM_TYPE__icontains=exam_type)

        if exam_date:
            today = datetime.today().date()
            if exam_date == "upcoming":
                exams = exams.filter(EXAM_DATE__gte=today)
            elif exam_date == "today":
                exams = exams.filter(EXAM_DATE=today)
                exams = exams.filter(EXAM_DATE__lt=today)
            elif exam_date == "passed":
                exams = exams.filter(EXAM_DATE__lt=today)

        if not exams.exists():
            return Response(data={"Error": f"{exam_type} Exam for {course_name} not found in term: {course_term} on {exam_date}"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ExamSerializer(exams, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        exam_date = request.data.get("EXAM_DATE")
        if exam_date:
            exam_date = datetime.strptime(exam_date, "%Y-%m-%d").date()
            if exam_date < datetime.today().date():
                return Response(data={"Error": "Exam date cannot be in the past"}, status=status.HTTP_400_BAD_REQUEST)

        course = Course.objects.get(pk=request.data.get("COURSE_CODE"))

        exam = Exam.objects.create(
            EXAM_DATE=request.data.get("EXAM_DATE"),
            EXAM_TIME=request.data.get("EXAM_TIME"),
            EXAM_DURATION=request.data.get("EXAM_DURATION"),
            EXAM_TYPE=request.data.get("EXAM_TYPE"),
            COURSE_CODE=course
        )

        return Response(True, status=status.HTTP_201_CREATED)


class ExamDetail(APIView):
    """
    Retrieve, update or delete an exam instance.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Exam.objects.get(pk=pk)
        except Exam.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        exam = self.get_object(pk)
        serializer = ExamSerializer(exam)
        return Response(serializer.data)

    def patch(self, request, pk):
        exam = self.get_object(pk)
        serializer = ExamSerializer(
            exam, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        exam = self.get_object(pk)
        exam.delete()
        return Response(data={True}, status=status.HTTP_204_NO_CONTENT)
