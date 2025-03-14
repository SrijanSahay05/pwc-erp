from django.urls import path
from .views import RegisterView, LoginView, EmailVerificationView, PhoneVerificationView, ResetPasswordView, PersonalInfoView, EducationInfoView, LogoutView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-email/', EmailVerificationView.as_view(), name='verify-email'),
    path('verify-phone/', PhoneVerificationView.as_view(), name='verify-phone'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('personal-info/', PersonalInfoView.as_view(), name='personal-info'),
    path('education-info/', EducationInfoView.as_view(), name='education-info'),
]