from datetime import datetime
from Management.models import ExaminerMobile
from Management.serializers import MobileSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


class ExaminerList(APIView):
    """
    List all examiners, or add a new examiner.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        name = request.query_params.get("name")
        phone = request.query_params.get("phone")
        status = request.query_params.get("status")

        if not name and not phone and not status:
            examiners = ExaminerMobile.objects.all()
            serializer = MobileSerializer(examiners, many=True)
            return Response(serializer.data)

        examiners = ExaminerMobile.objects.all()

        if name:
            examiners = examiners.filter(EXAMINER_NAME__icontains=name)

        if phone:
            examiners = examiners.get(EXAMINER_PHONE=phone)

        if status:
            examiners = examiners.filter(ACTIVE=status)

        if not examiners.exists():
            return Response({"error": "Examiner not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = MobileSerializer(examiners, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MobileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExaminerDetail(APIView):
    """
    Retrieve, update or delete an examiner instance.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, uuid):
        try:
            return ExaminerMobile.objects.get(id=uuid)
        except ExaminerMobile.DoesNotExist:
            raise Http404

    def get(self, request, uuid):
        examiner = self.get_object(uuid)
        serializer = MobileSerializer(examiner)
        return Response(serializer.data)

    def patch(self, request, uuid):
        examiner = self.get_object(uuid)
        serializer = MobileSerializer(
            examiner, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, uuid):
        examiner = self.get_object(uuid)
        examiner.delete()
        return Response(data={True}, status=status.HTTP_204_NO_CONTENT)


class ExaminerActiveCheck(APIView):
    """
    Check if an examiner's mobile is active.
    """

    def post(self, request):
        examiner_id = request.data.get("ID")
        if not examiner_id:
            return Response({"error": "ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            examiner = ExaminerMobile.objects.get(
                id=examiner_id)
        except ExaminerMobile.DoesNotExist:
            return Response({"error": "Examiner not found"}, status=status.HTTP_404_NOT_FOUND)

        is_active = examiner.ACTIVE
        return Response({"EXAMINER_MOBILE": examiner_id, "ACTIVE": is_active}, status=status.HTTP_200_OK)
