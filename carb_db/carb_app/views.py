# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.contrib.auth.models import User

from rest_framework import viewsets, permissions

from django_filters.rest_framework import DjangoFilterBackend

from carb_app.models import LyftToken, UberToken, LyftStats, UberStats
from carb_app.serializers import UserSerializer, LyftTokenSerializer, UberTokenSerializer, LyftStatsSerializer, UberStatsSerializer
#from carb_app.permissions import IsOwner

class LyftTokenViewSet(viewsets.ModelViewSet):
    queryset = LyftToken.objects.all()
    serializer_class = LyftTokenSerializer
    permission_classes = (permissions.IsAuthenticated,permissions.IsAdminUser)
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('uuid', 'owner')
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class UberTokenViewSet(viewsets.ModelViewSet):
    queryset = UberToken.objects.all()
    serializer_class = UberTokenSerializer
    permission_classes = (permissions.IsAuthenticated,permissions.IsAdminUser)
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('uuid', 'owner')
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class LyftStatsViewSet(viewsets.ModelViewSet):
    queryset = LyftStats.objects.all()
    serializer_class = LyftStatsSerializer
    permission_classes = (permissions.IsAuthenticated,permissions.IsAdminUser)
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class UberStatsViewSet(viewsets.ModelViewSet):
    queryset = UberStats.objects.all()
    serializer_class = UberStatsSerializer
    permission_classes = (permissions.IsAuthenticated,permissions.IsAdminUser)
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,IsOwner)

# Create your views here.
