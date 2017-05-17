from django.contrib.auth.models import User

from rest_framework import serializers

from carb_app.models import LyftToken, UberToken, LyftStats, UberStats

class LyftTokenSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = LyftToken
        fields = ('id', 'access_token', 'refresh_token', 'redirect_url', 'owner', 'updated')

class UberTokenSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = UberToken
        fields = ('id', 'access_token', 'refresh_token', 'redirect_url', 'owner', 'updated')

class LyftStatsSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = LyftStats
        fields = ('id', 'latitude', 'longitude', 'ride_request_time', 'ride_ad_pickup_time', 'ride_pickup_time', 'vehicle_type', 'vehicle_id', 'vehicles_aval', 'cancel_time', 'travel_time', 'arrival_time', 'dest_latitude', 'dest_longitude', 'owner', 'updated')

class UberStatsSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = LyftStats
        fields = ('id', 'latitude', 'longitude', 'ride_request_time', 'ride_ad_pickup_time', 'ride_pickup_time', 'vehicle_type', 'vehicle_id', 'vehicles_aval', 'cancel_time', 'travel_time', 'arrival_time', 'dest_latitude', 'dest_longitude', 'owner', 'updated')

class UserSerializer(serializers.ModelSerializer):
    lyft_token = serializers.PrimaryKeyRelatedField(many=True, queryset=LyftToken.objects.all())
    uber_token = serializers.PrimaryKeyRelatedField(many=True, queryset=UberToken.objects.all())
    class Meta:
        model = User
        fields = ('id', 'username', 'lyft_token', 'uber_token')