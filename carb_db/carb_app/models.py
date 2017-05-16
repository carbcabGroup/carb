# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User

import datetime

class LyftToken(models.Model):
    access_token =  models.CharField(max_length=255, blank=True)
    refresh_token = models.CharField(max_length=255, blank=True)
    owner = models.ForeignKey('auth.User', related_name='lyft_token', on_delete=models.CASCADE)
    updated = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        self.updated = datetime.datetime.now()
        super(LyftToken, self).save(*args, **kwargs)



# Create your models here.
