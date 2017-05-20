from carb_app.views import LyftTokenViewSet, UberTokenViewSet, LyftStatsViewSet, UberStatsViewSet, UserViewSet, UserCreateViewSet, api_root
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

ubertoken_list = UberTokenViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
ubertoken_detail = UberTokenViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

lyftstats_list = LyftStatsViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
lyftstats_detail = LyftStatsViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

uberstats_list = UberStatsViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
uberstats_detail = UberStatsViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

user_list = UserViewSet.as_view({
    'post': 'create',
    'get': 'list'
})
user_detail = UserViewSet.as_view({
    'get': 'retrieve'
})

user_register = UserCreateViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

urlpatterns = format_suffix_patterns([
    url(r'^$', api_root),
    url(r'^lyft_tokens/$', lyfttoken_list, name='lyfttoken_list'),
    url(r'^lyft_tokens/(?P<pk>[0-9]+)/$', lyfttoken_detail, name='lyfttoken_detail'),
    url(r'^uber_tokens/$', ubertoken_list, name='ubertoken_list'),
    url(r'^uber_tokens/(?P<pk>[0-9]+)/$', ubertoken_detail, name='ubertoken_detail'),
    url(r'^lyft_stats/$', lyftstats_list, name='lyftstats_list'),
    url(r'^lyft_stats/(?P<pk>[0-9]+)/$', lyftstats_detail, name='lyftstats_detail'),
    url(r'^uber_stats/$', uberstats_list, name='uberstats_list'),
    url(r'^uber_stats/(?P<pk>[0-9]+)/$', uberstats_detail, name='uberstats_detail'),
    url(r'^users/$', user_list, name='user-list'),
    url(r'^users/(?P<pk>[0-9]+)/$', user_detail, name='user-detail'),
    url(r'^register/$', user_register, name='user-register'),
])