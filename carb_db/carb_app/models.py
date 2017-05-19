# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User

import datetime, uuid

class LyftToken(models.Model):
    access_token =  models.CharField(max_length=255,blank=True)
    refresh_token = models.CharField(max_length=255,blank=True)
    access_token_exp = models.DateTimeField(null=True,blank=True)
    auth_uuid = models.UUIDField(primary_key=False,default=uuid.uuid4,editable=True,blank=True,null=True)
    auth_code = models.CharField(max_length=64,blank=True)
    auth_scope = models.CharField(max_length=255,blank=True)
    owner = models.ForeignKey('auth.User',related_name='lyft_token',on_delete=models.CASCADE)
    updated = models.DateTimeField(auto_now_add=True)
    def __unicode__(self):
        return "%s's Token" % self.owner.username
    def save(self, *args, **kwargs):
        self.updated = datetime.datetime.now()
        super(LyftToken, self).save(*args, **kwargs)

class UberToken(models.Model):
    access_token =  models.CharField(max_length=255,blank=True)
    refresh_token = models.CharField(max_length=255,blank=True)
    access_token_exp = models.DateTimeField(null=True,blank=True)
    auth_uuid = models.UUIDField(primary_key=False,default=uuid.uuid4,editable=True,blank=True,null=True)
    auth_code = models.CharField(max_length=64,blank=True)
    auth_scope = models.CharField(max_length=255,blank=True)
    owner = models.ForeignKey('auth.User',related_name='uber_token',on_delete=models.CASCADE)
    updated = models.DateTimeField(auto_now_add=True)
    def __unicode__(self):
        return "%s's Token" % self.owner.username
    def save(self, *args, **kwargs):
        self.updated = datetime.datetime.now()
        super(UberToken, self).save(*args, **kwargs)

class LyftStats(models.Model):
    latitude = models.CharField(max_length=24)
    longitude = models.CharField(max_length=24)
    ride_request_time = models.DateTimeField(null=True,blank=True)
    ride_ad_pickup_time = models.DateTimeField(null=True,blank=True)
    ride_pickup_time = models.DateTimeField(null=True,blank=True)
    vehicle_type = models.CharField(max_length=24,blank=True)
    vehicle_id = models.CharField(max_length=255,blank=True)
    cancel_time = models.DateTimeField(null=True,blank=True)
    vehicles_aval = models.IntegerField(null=True,blank=True)
    travel_time = models.CharField(max_length=24,blank=True)
    arrival_time = models.DateTimeField(null=True,blank=True)
    dest_latitude = models.CharField(max_length=24,blank=True)
    dest_longitude = models.CharField(max_length=24,blank=True)
    owner = models.ForeignKey('auth.User')
    updated = models.DateTimeField(auto_now_add=True)
    def __unicode__(self):
        return unicode(self.id )
    def save(self, *args, **kwargs):
        self.updated = datetime.datetime.now()
        super(LyftStats, self).save(*args, **kwargs)

class UberStats(models.Model):
    latitude = models.CharField(max_length=24)
    longitude = models.CharField(max_length=24)
    ride_request_time = models.DateTimeField(null=True,blank=True)
    ride_ad_pickup_time = models.DateTimeField(null=True,blank=True)
    ride_pickup_time = models.DateTimeField(null=True,blank=True)
    vehicle_type = models.CharField(max_length=24,blank=True)
    vehicle_id = models.CharField(max_length=255,blank=True)
    vehicles_aval = models.IntegerField(null=True,blank=True)
    cancel_time = models.DateTimeField(null=True,blank=True)
    travel_time = models.CharField(max_length=24,blank=True)
    arrival_time = models.DateTimeField(null=True,blank=True)
    dest_latitude = models.CharField(max_length=24,blank=True)
    dest_longitude = models.CharField(max_length=24,blank=True)
    owner = models.ForeignKey('auth.User')
    updated = models.DateTimeField(auto_now_add=True)
    def __unicode__(self):
        return unicode(self.id )
    def save(self, *args, **kwargs):
        self.updated = datetime.datetime.now()
        super(UberStats, self).save(*args, **kwargs)



# Create your models here.
