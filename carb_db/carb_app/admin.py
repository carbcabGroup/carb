# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from carb_app.models import LyftToken, UberToken, LyftStats, UberStats

admin.site.register(LyftToken)
admin.site.register(UberToken)
admin.site.register(LyftStats)
admin.site.register(UberStats)
# Register your models here.
