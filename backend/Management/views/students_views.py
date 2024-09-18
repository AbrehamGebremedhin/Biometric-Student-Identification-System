import json
import numpy as np
from Management.models import Student, Attendance
from Management.serializers import StudentSerializer, AttendanceSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from facial import FacialRecognition

facial = FacialRecognition()


class StudentList(APIView):
    """
    List all students, or create a new Student.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student_name = request.query_params.get("student_name")
        student_batch = request.query_params.get("batch")

        students = Student.objects.all()

        if not student_name and not student_batch:
            serializer = StudentSerializer(students, many=True)
            return Response(serializer.data)

        students = Student.objects.all()

        if student_name:
            students = students.filter(STUDENT_NAME__icontains=student_name)

        if student_batch:
            students = students.filter(STUDENT_BATCH__icontains=student_batch)

        if not students.exists():
            return Response(data={"Error": f"Student with the name: {student_name} in batch {student_batch} not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    def post(self, request):
        extracted_features = []
        for side in ['left', 'right', 'front']:
            image_file = request.FILES.get(f'{side}_image')
            if image_file:
                features = facial.extract_features(
                    image_file.read(), side=side)
                if isinstance(features, str) and features == "No face detected":
                    return Response(data={"Error": f"No face detected in the {side} image"}, status=status.HTTP_400_BAD_REQUEST)

                # Convert NumPy array to list if necessary
                if isinstance(features, np.ndarray):
                    features = features.tolist()

                extracted_features.append({"side": side, "features": features})
            else:
                return Response(data={"Error": f"{side} image not found"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            extracted_features_json = json.dumps(extracted_features)
        except (TypeError, ValueError) as e:
            return Response(data={"Error": "Invalid features data"}, status=status.HTTP_400_BAD_REQUEST)

        data = {
            "STUDENT_ID": request.data.get("STUDENT_ID"),
            "STUDENT_NAME": request.data.get("STUDENT_NAME"),
            "STUDENT_BATCH": request.data.get("STUDENT_BATCH"),
            "STUDENT_EXTRACTED_FEATURES": extracted_features_json
        }

        serializer = StudentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentDetail(APIView):
    """
    Retrieve, update or delete a student instance.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, id):
        try:
            return Student.objects.get(STUDENT_ID=id)
        except Student.DoesNotExist:
            raise Http404

    def get(self, request, id):
        student = self.get_object(id)
        serializer = StudentSerializer(student)
        return Response(serializer.data)

    def patch(self, request, id):
        student = self.get_object(id)

        for key in request.data:
            if key.endswith('image'):
                side = key[:-6]  # Remove the last 5 characters ('image')
                extracted_features = json.loads(
                    student.STUDENT_EXTRACTED_FEATURES)
                extracted_features = [
                    item for item in extracted_features if item['side'] != side]
                image_file = request.FILES.get(f'{side}_image')
                if image_file:
                    features = facial.extract_features(
                        image_file.read(), side=side)
                    if isinstance(features, str) and features == "No face detected":
                        return Response(data={"Error": f"No face detected in the {side} image"}, status=status.HTTP_400_BAD_REQUEST)

                    # Convert NumPy array to list if necessary
                    if isinstance(features, np.ndarray):
                        features = features.tolist()

                    extracted_features.append(
                        {"side": side, "features": features})

                    # Save the updated JSON data back to the EXTRACTED_FEATURES attribute
                    student.EXTRACTED_FEATURES = json.dumps(extracted_features)

                else:
                    return Response(data={"Error": f"{side} image not found"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = StudentSerializer(
            student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        student = self.get_object(id)
        student.delete()
        return Response(data={True}, status=status.HTTP_204_NO_CONTENT)
