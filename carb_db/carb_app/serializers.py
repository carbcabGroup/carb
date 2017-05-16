from django.contrib.auth.models import User

from rest_framework import serializers

from carb_app.models import LyftToken

class LyftTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = LyftToken
        fields = ('id', 'access_token', 'refresh_token', 'owner', 'updated')

class UserSerializer(serializers.ModelSerializer):
    lyft_token = serializers.PrimaryKeyRelatedField(many=True, queryset=LyftToken.objects.all())
    class Meta:
        model = User
        fields = ('id', 'username', 'lyft_token')