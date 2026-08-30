from django import forms
from django.contrib import admin
from django.contrib.auth import get_user_model

from .models import RiderProfile

User = get_user_model()


class RiderCreationForm(forms.ModelForm):

    """
    Only used when adding a new RiderProfile. Creates the
    linked User account in the same step, since riders never
    register themselves — staff enters their details after
    reviewing the physical application submitted at the office.
    """

    username = forms.CharField(max_length=150)
    phone = forms.CharField(max_length=15)
    password = forms.CharField(
        widget=forms.PasswordInput,
        help_text=(
            "Hand this to the rider directly. "
            "They should change it after first login."
        ),
    )

    class Meta:
        model = RiderProfile
        fields = ["full_name"]

    def clean_username(self):
        username = self.cleaned_data["username"]
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError(
                "A user with this username already exists."
            )
        return username

    def clean_phone(self):
        phone = self.cleaned_data["phone"]
        if User.objects.filter(phone=phone).exists():
            raise forms.ValidationError(
                "A user with this phone number already exists."
            )
        return phone

    def save(self, commit=True):
        rider_profile = super().save(commit=False)

        user = User(
            username=self.cleaned_data["username"],
            phone=self.cleaned_data["phone"],
            role="rider",
            is_active=True,
        )
        user.set_password(self.cleaned_data["password"])
        user.save()

        rider_profile.user = user

        if commit:
            rider_profile.save()

        return rider_profile


@admin.register(RiderProfile)
class RiderProfileAdmin(admin.ModelAdmin):

    list_display = [
        "id",
        "full_name",
        "user",
        "availability_status",
        "user_is_active",
    ]

    list_filter = ["availability_status", "user__is_active"]
    search_fields = ["full_name", "user__username", "user__phone"]

    def user_is_active(self, obj):
        return obj.user.is_active
    user_is_active.boolean = True
    user_is_active.short_description = "Active"

    def get_form(self, request, obj=None, **kwargs):
        if obj is None:
            kwargs["form"] = RiderCreationForm
        return super().get_form(request, obj, **kwargs)

    def get_fields(self, request, obj=None):
        if obj is None:
            return ["username", "phone", "password", "full_name"]
        return ["full_name", "availability_status"]