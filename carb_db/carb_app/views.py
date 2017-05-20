# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.contrib.auth.models import User

from rest_framework import viewsets, permissions

from rest_framework import filters

from carb_app.models import LyftToken, UberToken, LyftStats, UberStats
from carb_app.serializers import UserSerializer, LyftTokenSerializer, UberTokenSerializer, LyftStatsSerializer, UberStatsSerializer
#from carb_app.permissions import IsOwner

class LyftTokenViewSet(viewsets.ModelViewSet):
    queryset = LyftToken.objects.all()
    serializer_class = LyftTokenSerializer
    permission_classes = (permissions.IsAuthenticated,permissions.IsAdminUser)
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    def get_queryset(self):
        user = self.request.user
        if user == 'carbAdmin':
            return LyftToken.objects.all()
        else:
            return LyftToken.objects.filter(owner=user)

class UberTokenViewSet(viewsets.ModelViewSet):
    queryset = UberToken.objects.all()
    serializer_class = UberTokenSerializer
    permission_classes = (permissions.IsAuthenticated,permissions.IsAdminUser)
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    def get_queryset(self):
        user = self.request.user
        if user == 'carbAdmin':
            return UberToken.objects.all()
        else:
            return UberToken.objects.filter(owner=user)

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
    permission_classes = (permissions.IsAuthenticated,permissions.IsAdminUser)

# Create your views here.
