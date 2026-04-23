from django.contrib import admin

from .models import CampusLocation, Category, Item, UserProfile

admin.site.register(Category)
admin.site.register(CampusLocation)
admin.site.register(UserProfile)
admin.site.register(Item)
