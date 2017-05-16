# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.contrib.auth.models import User

from rest_framework import viewsets, permissions

from carb_app.models import LyftToken
from carb_app.serializers import UserSerializer, LyftTokenSerializer

class LyftTokenViewSet(viewsets.ModelViewSet):
    queryset = LyftToken.objects.all()
    serializer_class = LyftTokenSerializer
    permission_classes = (permissions.IsAuthenticated,permissions.IsAdminUser)
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,permissions.IsAdminUser)

# Create your views here.
