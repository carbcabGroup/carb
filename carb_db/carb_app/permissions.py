from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user == 'carbAdmin':
            return True
        return obj.owner == request.user