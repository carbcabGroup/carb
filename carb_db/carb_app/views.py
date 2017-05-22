# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.contrib.auth.models import User

from rest_framework import viewsets, permissions

from rest_framework import filters

from carb_app.models import LyftToken, UberToken, LyftStats, UberStats
from carb_app.serializers import UserSerializer, LyftTokenSerializer, UberTokenSerializer, LyftStatsSerializer, UberStatsSerializer, UserCreateSerializer
from carb_app.permissions import IsOwner, IsUser

class LyftTokenViewSet(viewsets.ModelViewSet):
    queryset = LyftToken.objects.all()
    serializer_class = LyftTokenSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = (filters.SearchFilter,)
    search_fields = ('auth_uuid',)
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    def get_queryset(self):
        user = str(self.request.user)
        if user != 'carbAdmin':
            return LyftToken.objects.filter(owner=self.request.user)
        return LyftToken.objects.filter()

class UberTokenViewSet(viewsets.ModelViewSet):
    queryset = UberToken.objects.all()
    serializer_class = UberTokenSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = (filters.SearchFilter,)
    search_fields = ('auth_uuid',)
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    def get_queryset(self):
        user = str(self.request.user)
        if user != 'carbAdmin':
            return UberToken.objects.filter(owner=self.request.user)
        return UberToken.objects.filter()

class LyftStatsViewSet(viewsets.ModelViewSet):
    queryset = LyftStats.objects.all()
    serializer_class = LyftStatsSerializer
    permission_classes = (permissions.IsAuthenticated,)
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class UberStatsViewSet(viewsets.ModelViewSet):
    queryset = UberStats.objects.all()
    serializer_class = UberStatsSerializer
    permission_classes = (permissions.IsAuthenticated,)
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = (filters.SearchFilter,)
    search_fields = ('username',)
    def get_queryset(self):
        user = str(self.request.user)
        if user != 'carbAdmin':
            return User.objects.filter(username=self.request.user)
        return User.objects.filter()

class UserCreateViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    def get_queryset(self):
        user = str(self.request.user)
        if user != 'carbAdmin':
            return User.objects.filter(username=self.request.user)
        return User.objects.filter()
