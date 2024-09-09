import json
from Management.models import Course
from Management.serializers import CourseSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


class CourseList(APIView):
    """
    List all courses, or add a new course.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        course_name = request.query_params.get("name")
        course_term = request.query_params.get("term")

        courses = Course.objects.all()

        if not course_name and not course_term:
            serializer = CourseSerializer(courses, many=True)
            return Response(serializer.data)

        courses = Course.objects.all()

        if course_name:
            courses = courses.filter(COURSE_NAME__icontains=course_name)

        if course_term:
            courses = courses.filter(TERM__icontains=course_term)

        if not courses:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CourseDetail(APIView):
    """
    Retrieve, update or delete a course instance.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        course = self.get_object(pk)
        serializer = CourseSerializer(course)
        return Response(serializer.data)

    def patch(self, request, pk):
        course = self.get_object(pk)
        serializer = CourseSerializer(
            course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        course = self.get_object(pk)
        course.delete()
        return Response(data={True}, status=status.HTTP_204_NO_CONTENT)
