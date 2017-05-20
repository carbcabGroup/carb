from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = str(request.user)
        if user == 'carbAdmin':
            print 'ADMIN'
            return True
        print 'NOT ADMIN'
        return obj.owner == request.user

class IsUser(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = str(request.user)
        if user == 'carbAdmin':
            print 'ADMIN'
            return True
        print 'NOT ADMIN'
        return obj.username == request.user