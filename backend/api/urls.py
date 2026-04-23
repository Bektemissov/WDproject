from django.urls import path

from .views import (
    AdminPendingItemListView,
    AdminPublishedItemListView,
    CategoryListView,
    ItemDetailView,
    ItemModerationView,
    ItemToggleStatusView,
    LocationListView,
    MyItemListCreateView,
    PublicItemListView,
    login_view,
    logout_view,
    me_view,
    profile_view,
    register_view,
)

urlpatterns = [
    path('auth/register/', register_view),
    path('auth/login/', login_view),
    path('auth/logout/', logout_view),
    path('auth/me/', me_view),
    path('profile/', profile_view),
    path('categories/', CategoryListView.as_view()),
    path('locations/', LocationListView.as_view()),
    path('items/', PublicItemListView.as_view()),
    path('items/my/', MyItemListCreateView.as_view()),
    path('items/pending/', AdminPendingItemListView.as_view()),
    path('items/published/', AdminPublishedItemListView.as_view()),
    path('items/<int:item_id>/', ItemDetailView.as_view()),
    path('items/<int:item_id>/moderate/', ItemModerationView.as_view()),
    path('items/<int:item_id>/toggle-status/', ItemToggleStatusView.as_view()),
]
