from snippets.views import LyftTokenViewSet, UserViewSet, api_root
from rest_framework import renderers

lyfttoken_list = LyftTokenViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
lyfttoken_detail = LyftTokenViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

user_list = UserViewSet.as_view({
    'get': 'list'
})
user_detail = UserViewSet.as_view({
    'get': 'retrieve'
})

urlpatterns = format_suffix_patterns([
    url(r'^$', api_root),
    url(r'^lyft_tokens/$', lyfttoken_list, name='lyfttoken_list'),
    url(r'^lyft_tokens/(?P<pk>[0-9]+)/$', lyfttoken_detail, name='lyfttoken_detail'),
    url(r'^users/$', user_list, name='user-list'),
    url(r'^users/(?P<pk>[0-9]+)/$', user_detail, name='user-detail')
])