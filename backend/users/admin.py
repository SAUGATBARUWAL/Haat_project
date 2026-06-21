# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, SellerProfile, CustomerProfile


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active']
    actions = ['ban_users', 'unban_users']

    def ban_users(self, request, queryset):
        queryset.update(is_active=False)
    ban_users.short_description = "Ban selected users"

    def unban_users(self, request, queryset):
        queryset.update(is_active=True)
    unban_users.short_description = "Unban selected users"


admin.site.register(SellerProfile)
admin.site.register(CustomerProfile)