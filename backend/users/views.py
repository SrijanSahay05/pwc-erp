from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from django.db import transaction
import random
import datetime
import logging
from rest_framework.permissions import IsAuthenticated

from .serializers import CustomUserSerializer, PersonalInfoSerializer, EducationInfoSerializer
from .models import CustomUser, EmailOTP, PhoneOTP, PersonalInfo, EducationInfo

logger = logging.getLogger(__name__)  # Logging for error tracking

# Rate limit settings
# EMAIL_OTP_LIMIT = "email_otp_limit_{email}"  # Lines to remove before prod
# PHONE_OTP_LIMIT = "phone_otp_limit_{phone}"  # Lines to remove before prod
# OTP_REQUEST_LIMIT = 3  # Max OTPs allowed per hour  # Lines to remove before prod


def send_otp_email(email, otp):
    """Sends OTP via email with error handling."""
    subject = "Email Verification OTP"
    message = f"Your OTP is {otp}"
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [email]

    try:
        send_mail(subject, message, email_from, recipient_list)
        print(f"Email sent to: {email}")  # Line to remove before prod
    except Exception as e:
        logger.error(f"Error sending OTP email to {email}: {str(e)}")
        print(f"Error sending email to {email}: {str(e)}")  # Line to remove before prod


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    def create(self, request, *args, **kwargs):
        print("RegisterView - create called")  # Line to remove before prod
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            print("RegisterView - User created successfully")  # Line to remove before prod
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        else:
            print(f"RegisterView - Serializer errors: {serializer.errors}")  # Line to remove before prod
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        print("LoginView - post called")  # Line to remove before prod
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            print("LoginView - Username or password not provided")  # Line to remove before prod
            return Response({'error': 'Please provide both username and password'},
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if user:
            print(f"LoginView - User authenticated: {username}")  # Line to remove before prod
            if not user.is_email_verified:
                print(f"LoginView - Email not verified for: {username}")  # Line to remove before prod
                return Response({'error': 'Email verification required.'},
                                status=status.HTTP_401_UNAUTHORIZED)

            if not user.is_phone_verified:
                print(f"LoginView - Phone not verified for: {username}")  # Line to remove before prod
                return Response({'error': 'Phone verification required.'},
                                status=status.HTTP_401_UNAUTHORIZED)

            refresh = RefreshToken.for_user(user)
            print(f"LoginView - Login successful for: {username}")  # Line to remove before prod
            return Response({
                'user': CustomUserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        else:
            print(f"LoginView - Invalid credentials for: {username}")  # Line to remove before prod
            return Response({'error': 'Invalid credentials'},
                            status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Logout user by blacklisting the refresh token"""
        print("LogoutView - post called")  # Line to remove before prod
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                print("LogoutView - Refresh token not provided")  # Line to remove before prod
                return Response({'error': 'Refresh token is required'}, 
                              status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()
            
            print(f"LogoutView - User {request.user.username} logged out successfully")  # Line to remove before prod
            return Response({'message': 'Logged out successfully'}, 
                          status=status.HTTP_200_OK)
        except Exception as e:
            print(f"LogoutView - Error: {str(e)}")  # Line to remove before prod
            return Response({'error': 'Invalid token'}, 
                          status=status.HTTP_400_BAD_REQUEST)

class EmailVerificationView(APIView):
    def post(self, request):
        """Send OTP for email verification"""
        print("EmailVerificationView - post called")  # Line to remove before prod
        email = request.data.get('email')

        if not email:
            print("EmailVerificationView - Email not provided")  # Line to remove before prod
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.filter(email=email).first()
        if not user:
            print(f"EmailVerificationView - User not found for email: {email}")  # Line to remove before prod
            return Response({'error': 'User not found. Register first.'}, status=status.HTTP_400_BAD_REQUEST)

        # Rate limit OTP requests
        # cache_key = EMAIL_OTP_LIMIT.format(email=email)  # Lines to remove before prod
        # otp_count = cache.get(cache_key, 0)  # Lines to remove before prod
        # if otp_count >= OTP_REQUEST_LIMIT:  # Lines to remove before prod
        #     print(f"EmailVerificationView - OTP request limit reached for: {email}")  # Line to remove before prod
        #     return Response({'error': 'OTP request limit reached. Try again later.'},  # Lines to remove before prod
        #                     status=status.HTTP_429_TOO_MANY_REQUESTS)  # Lines to remove before prod

        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        expires_at = timezone.now() + datetime.timedelta(minutes=10)

        EmailOTP.objects.create(user=user, email=email, otp=otp, expires_at=expires_at)

        send_otp_email(email, otp)

        # cache.set(cache_key, otp_count + 1, timeout=3600)  # Limit resets every hour  # Lines to remove before prod
        print(f"EmailVerificationView - OTP sent successfully to: {email}, OTP: {otp}")  # Line to remove before prod

        return Response({'message': 'OTP sent successfully'})

    def put(self, request):
        """Verify email OTP"""
        print("EmailVerificationView - put called")  # Line to remove before prod
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            print("EmailVerificationView - Email or OTP not provided")  # Line to remove before prod
            return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

        email_otp = EmailOTP.objects.filter(email=email, is_verified=False).order_by('-created_at').first()
        if not email_otp:
            print(f"EmailVerificationView - No OTP found for email: {email}")  # Line to remove before prod
            return Response({'error': 'No OTP found. Request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        if email_otp.expires_at < timezone.now():
            print(f"EmailVerificationView - OTP expired for email: {email}")  # Line to remove before prod
            return Response({'error': 'OTP expired. Request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        if email_otp.otp != otp:
            print(f"EmailVerificationView - Invalid OTP for email: {email}")  # Line to remove before prod
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        email_otp.is_verified = True
        email_otp.save()

        user = CustomUser.objects.filter(email=email).first()
        if user:
            user.is_email_verified = True
            user.save()

        print(f"EmailVerificationView - Email verified successfully for: {email}")  # Line to remove before prod
        return Response({'message': 'Email verified successfully'})


class PhoneVerificationView(APIView):
    def post(self, request):
        """Send OTP for phone verification"""
        print("PhoneVerificationView - post called")  # Line to remove before prod
        phone = request.data.get('phone')

        if not phone:
            print("PhoneVerificationView - Phone number not provided")  # Line to remove before prod
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.filter(phone=phone).first()
        if not user:
            print(f"PhoneVerificationView - User not found for phone: {phone}")  # Line to remove before prod
            return Response({'error': 'User not found. Register first.'}, status=status.HTTP_400_BAD_REQUEST)

        # Rate limit OTP requests
        # cache_key = PHONE_OTP_LIMIT.format(phone=phone)  # Lines to remove before prod
        # otp_count = cache.get(cache_key, 0)  # Lines to remove before prod
        # if otp_count >= OTP_REQUEST_LIMIT:  # Lines to remove before prod
        #     print(f"PhoneVerificationView - OTP request limit reached for: {phone}")  # Line to remove before prod
        #     return Response({'error': 'OTP request limit reached. Try again later.'},  # Lines to remove before prod
        #                     status=status.HTTP_429_TOO_MANY_REQUESTS)  # Lines to remove before prod

        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        expires_at = timezone.now() + datetime.timedelta(minutes=10)

        PhoneOTP.objects.create(user=user, phone=phone, otp=otp, expires_at=expires_at)

        # TODO: Integrate SMS Gateway to send OTP via SMS

        # cache.set(cache_key, otp_count + 1, timeout=3600)  # Limit resets every hour  # Lines to remove before prod
        print(f"PhoneVerificationView - OTP sent successfully to: {phone}, OTP: {otp}")  # Line to remove before prod

        return Response({'message': 'OTP sent successfully'})

    def put(self, request):
        """Verify phone OTP"""
        print("PhoneVerificationView - put called")  # Line to remove before prod
        phone = request.data.get('phone')
        otp = request.data.get('otp')

        if not phone or not otp:
            print("PhoneVerificationView - Phone or OTP not provided")  # Line to remove before prod
            return Response({'error': 'Phone number and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

        phone_otp = PhoneOTP.objects.filter(phone=phone, is_verified=False).order_by('-created_at').first()
        if not phone_otp:
            print(f"PhoneVerificationView - No OTP found for phone: {phone}")  # Line to remove before prod
            return Response({'error': 'No OTP found. Request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        if phone_otp.expires_at < timezone.now():
            print(f"PhoneVerificationView - OTP expired for phone: {phone}")  # Line to remove before prod
            return Response({'error': 'OTP expired. Request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        if phone_otp.otp != otp:
            print(f"PhoneVerificationView - Invalid OTP for phone: {phone}")  # Line to remove before prod
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        phone_otp.is_verified = True
        phone_otp.save()

        user = CustomUser.objects.filter(phone=phone).first()
        if user:
            user.is_phone_verified = True
            user.save()

        print(f"PhoneVerificationView - Phone verified successfully for: {phone}")  # Line to remove before prod
        return Response({'message': 'Phone number verified successfully'})


class ResetPasswordView(APIView):
    def post(self, request):
        """Send OTP for password reset"""
        print("ResetPasswordView - post called")  # Line to remove before prod
        email = request.data.get('email')

        if not email:
            print("ResetPasswordView - Email not provided")  # Line to remove before prod
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.filter(email=email).first()
        if not user:
            print(f"ResetPasswordView - User not found for email: {email}")  # Line to remove before prod
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

        # Rate limit OTP requests
        # cache_key = EMAIL_OTP_LIMIT.format(email=email)  # Lines to remove before prod
        # otp_count = cache.get(cache_key, 0)  # Lines to remove before prod
        # if otp_count >= OTP_REQUEST_LIMIT:  # Lines to remove before prod
        #     print(f"ResetPasswordView - OTP request limit reached for: {email}")  # Line to remove before prod
        #     return Response({'error': 'OTP request limit reached. Try again later.'},  # Lines to remove before prod
        #                     status=status.HTTP_429_TOO_MANY_REQUESTS)  # Lines to remove before prod

        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        expires_at = timezone.now() + datetime.timedelta(minutes=10)

        EmailOTP.objects.create(user=user, email=email, otp=otp, expires_at=expires_at)
        send_otp_email(email, otp)

        # cache.set(cache_key, otp_count + 1, timeout=3600)  # Limit resets every hour  # Lines to remove before prod
        print(f"ResetPasswordView - Password reset OTP sent successfully to: {email}, OTP: {otp}")  # Line to remove before prod

        return Response({'message': 'Password reset OTP sent successfully'})

    def put(self, request):
        """Reset password with OTP verification"""
        print("ResetPasswordView - put called")  # Line to remove before prod
        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        if not email or not otp or not new_password:
            print("ResetPasswordView - Email, OTP, or new password not provided")  # Line to remove before prod
            return Response({'error': 'Email, OTP and new password are required'},
                            status=status.HTTP_400_BAD_REQUEST)

        email_otp = EmailOTP.objects.filter(email=email, is_verified=False).order_by('-created_at').first()
        if not email_otp:
            print(f"ResetPasswordView - No OTP found for email: {email}")  # Line to remove before prod
            return Response({'error': 'No OTP found. Request a new one.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if email_otp.expires_at < timezone.now():
            print(f"ResetPasswordView - OTP expired for email: {email}")  # Line to remove before prod
            return Response({'error': 'OTP expired. Request a new one.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if email_otp.otp != otp:
            print(f"ResetPasswordView - Invalid OTP for email: {email}")  # Line to remove before prod
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.filter(email=email).first()
        if user:
            user.set_password(new_password)
            user.save()
            email_otp.is_verified = True
            email_otp.save()

            print(f"ResetPasswordView - Password reset successful for: {email}")  # Line to remove before prod
            return Response({'message': 'Password reset successful'})

        print(f"ResetPasswordView - User not found for email: {email}")  # Line to remove before prod
        return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
class PersonalInfoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """Retrieve personal information."""
        personal_info, created = PersonalInfo.objects.get_or_create(user=request.user)
        serializer = PersonalInfoSerializer(personal_info)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        """Create new personal information."""
        serializer = PersonalInfoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        """Update personal information."""
        personal_info = PersonalInfo.objects.get_or_create(user=request.user)[0]
        serializer = PersonalInfoSerializer(personal_info, data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, *args, **kwargs):
        """Partially update personal information."""
        personal_info = PersonalInfo.objects.get_or_create(user=request.user)[0]
        serializer = PersonalInfoSerializer(personal_info, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EducationInfoView(generics.RetrieveUpdateAPIView):
    """
    API view for managing education information.
    GET: Retrieve education information
    PUT/PATCH: Update education information
    """
    serializer_class = EducationInfoSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return EducationInfo.objects.get_or_create(user=self.request.user)[0]

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)