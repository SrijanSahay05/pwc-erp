from django.urls import path
from .views import RegisterView, LoginView, EmailVerificationView, PhoneVerificationView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-email/', EmailVerificationView.as_view(), name='verify-email'),
    path('verify-phone/', PhoneVerificationView.as_view(), name='verify-phone'),
]