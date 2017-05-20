from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = str(request.user)
        if user == 'carbAdmin':
            return True
        return obj.owner == request.user

class IsUser(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = str(request.user)
        if user == 'carbAdmin':
            return True
        return obj.username == request.user