from django.contrib import admin
from .models import CustomUser, Application, PersonalInfo, EducationInfo, EmailOTP, PhoneOTP

# Register your models here.
admin.site.register(CustomUser)
admin.site.register(Application)
admin.site.register(PersonalInfo)
admin.site.register(EducationInfo)
admin.site.register(EmailOTP)
admin.site.register(PhoneOTP)   

