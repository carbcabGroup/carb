# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User

import datetime

class LyftToken(models.Model):
    access_token =  models.CharField(max_length=255, blank=True)
    refresh_token = models.CharField(max_length=255, blank=True)
    redirect_url =  models.CharField(max_length=1024, blank=True)
    owner = models.ForeignKey('auth.User', related_name='lyft_token', on_delete=models.CASCADE)
    updated = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return "%s's Token" % self.owner.username
    def save(self, *args, **kwargs):
        self.updated = datetime.datetime.now()
        super(LyftToken, self).save(*args, **kwargs)

class UberToken(models.Model):
    access_token =  models.CharField(max_length=255, blank=True)
    refresh_token = models.CharField(max_length=255, blank=True)
    redirect_url =  models.CharField(max_length=1024, blank=True)
    owner = models.ForeignKey('auth.User', related_name='uber_token', on_delete=models.CASCADE)
    updated = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return "%s's Token" % self.owner.username
    def save(self, *args, **kwargs):
        self.updated = datetime.datetime.now()
        super(UberToken, self).save(*args, **kwargs)

class LyftStats(models.Model):
    latitude = models.CharField(max_length=24)
    longitude = models.CharField(max_length=24)
    ride_request_time = models.DateTimeField(blank=True)
    ride_ad_pickup_time = models.DateTimeField(blank=True)
    ride_pickup_time = models.DateTimeField(blank=True)
    vehicle_type = models.CharField(max_length=24,blank=True)
    vehicle_id = models.CharField(max_length=255,blank=True)
    vehicles_aval = models.IntegerField(blank=True)
    owner = models.ForeignKey('auth.User')
    updated = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.id
    def save(self, *args, **kwargs):
        self.updated = datetime.datetime.now()
        super(LyftStats, self).save(*args, **kwargs)

class UberStats(models.Model):
    latitude = models.CharField(max_length=24)
    longitude = models.CharField(max_length=24)
    ride_request_time = models.DateTimeField(blank=True)
    ride_ad_pickup_time = models.DateTimeField(blank=True)
    ride_pickup_time = models.DateTimeField(blank=True)
    vehicle_type = models.CharField(max_length=24,blank=True)
    vehicle_id = models.CharField(max_length=255,blank=True)
    vehicles_aval = models.IntegerField(blank=True)
    owner = models.ForeignKey('auth.User')
    updated = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.id
    def save(self, *args, **kwargs):
        self.updated = datetime.datetime.now()
        super(UberStats, self).save(*args, **kwargs)



# Create your models here.
