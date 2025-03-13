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

from .serializers import CustomUserSerializer
from .models import CustomUser, EmailOTP, PhoneOTP

logger = logging.getLogger(__name__)  # Logging for error tracking

# Rate limit settings
EMAIL_OTP_LIMIT = "email_otp_limit_{email}"
PHONE_OTP_LIMIT = "phone_otp_limit_{phone}"
OTP_REQUEST_LIMIT = 3  # Max OTPs allowed per hour

def send_otp_email(email, otp):
    """ Sends OTP via email with error handling. """
    subject = "Email Verification OTP"
    message = f"Your OTP is {otp}"
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [email]

    try:
        send_mail(subject, message, email_from, recipient_list)
    except Exception as e:
        logger.error(f"Error sending OTP email to {email}: {str(e)}")

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Please provide both username and password'},
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if user:
            if not user.is_email_verified:
                return Response({'error': 'Email verification required.'},
                                status=status.HTTP_401_UNAUTHORIZED)

            if not user.is_phone_verified:
                return Response({'error': 'Phone verification required.'},
                                status=status.HTTP_401_UNAUTHORIZED)

            refresh = RefreshToken.for_user(user)
            return Response({
                'user': CustomUserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        else:
            return Response({'error': 'Invalid credentials'},
                            status=status.HTTP_401_UNAUTHORIZED)

class EmailVerificationView(APIView):
    def post(self, request):
        """ Send OTP for email verification """
        email = request.data.get('email')

        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.filter(email=email).first()
        if not user:
            return Response({'error': 'User not found. Register first.'}, status=status.HTTP_400_BAD_REQUEST)

        # Rate limit OTP requests
        cache_key = EMAIL_OTP_LIMIT.format(email=email)
        otp_count = cache.get(cache_key, 0)
        if otp_count >= OTP_REQUEST_LIMIT:
            return Response({'error': 'OTP request limit reached. Try again later.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        expires_at = timezone.now() + datetime.timedelta(minutes=10)

        EmailOTP.objects.create(user=user, email=email, otp=otp, expires_at=expires_at)

        send_otp_email(email, otp)

        cache.set(cache_key, otp_count + 1, timeout=3600)  # Limit resets every hour

        return Response({'message': 'OTP sent successfully'})

    def put(self, request):
        """ Verify email OTP """
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

        email_otp = EmailOTP.objects.filter(email=email, is_verified=False).order_by('-created_at').first()
        if not email_otp:
            return Response({'error': 'No OTP found. Request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        if email_otp.expires_at < timezone.now():
            return Response({'error': 'OTP expired. Request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        if email_otp.otp != otp:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        email_otp.is_verified = True
        email_otp.save()

        user = CustomUser.objects.filter(email=email).first()
        if user:
            user.is_email_verified = True
            user.save()

        return Response({'message': 'Email verified successfully'})

class PhoneVerificationView(APIView):
    def post(self, request):
        """ Send OTP for phone verification """
        phone = request.data.get('phone')

        if not phone:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.filter(phone=phone).first()
        if not user:
            return Response({'error': 'User not found. Register first.'}, status=status.HTTP_400_BAD_REQUEST)

        # Rate limit OTP requests
        cache_key = PHONE_OTP_LIMIT.format(phone=phone)
        otp_count = cache.get(cache_key, 0)
        if otp_count >= OTP_REQUEST_LIMIT:
            return Response({'error': 'OTP request limit reached. Try again later.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        expires_at = timezone.now() + datetime.timedelta(minutes=10)

        PhoneOTP.objects.create(user=user, phone=phone, otp=otp, expires_at=expires_at)

        # TODO: Integrate SMS Gateway to send OTP via SMS

        cache.set(cache_key, otp_count + 1, timeout=3600)  # Limit resets every hour

        return Response({'message': 'OTP sent successfully'})

    def put(self, request):
        """ Verify phone OTP """
        phone = request.data.get('phone')
        otp = request.data.get('otp')

        if not phone or not otp:
            return Response({'error': 'Phone number and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

        phone_otp = PhoneOTP.objects.filter(phone=phone, is_verified=False).order_by('-created_at').first()
        if not phone_otp:
            return Response({'error': 'No OTP found. Request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        if phone_otp.expires_at < timezone.now():
            return Response({'error': 'OTP expired. Request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        if phone_otp.otp != otp:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        phone_otp.is_verified = True
        phone_otp.save()

        user = CustomUser.objects.filter(phone=phone).first()
        if user:
            user.is_phone_verified = True
            user.save()

        return Response({'message': 'Phone number verified successfully'})