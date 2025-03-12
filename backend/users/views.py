from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import CustomUserSerializer
from .models import CustomUser, EmailOTP, PhoneOTP
from rest_framework.views import APIView
from django.core.mail import send_mail
from django.conf import settings
import certifi
import ssl
ssl._create_default_https_context = ssl.create_default_context(cafile=certifi.where())

def send_otp_email(email, otp):
    subject="Email Verification OTP"
    message=f"Your OTP is {otp}"
    email_from=settings.EMAIL_HOST_USER
    recipient_list=[email]
    send_mail(subject, message, email_from, recipient_list)

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
            if not user.is_email_verified or not user.is_phone_verified:
                user.delete()
                return Response({'error': 'Email and phone verification required. Please register again.'},
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
        user = request.user
        email = request.data.get('email')

        if not email:
            return Response({'error': 'Email is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Generate 6 digit OTP
        import random
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])

        # Set expiry time to 10 minutes from now
        from django.utils import timezone
        import datetime
        expires_at = timezone.now() + datetime.timedelta(minutes=10)

        # Create EmailOTP record
        EmailOTP.objects.create(
            user=user,
            email=email,
            otp=otp,
            expires_at=expires_at
        )

        # Print OTP to terminal for development
        print(f"Email verification OTP for {email}: {otp}")
        send_otp_email(email, otp)

        return Response({'message': 'OTP sent successfully'})

    def put(self, request):
        user = request.user
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({'error': 'Email and OTP are required'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Get latest OTP record
        email_otp = EmailOTP.objects.filter(
            user=user,
            email=email,
            is_verified=False
        ).order_by('-created_at').first()

        if not email_otp:
            user.delete()
            return Response({'error': 'No OTP found for this email. Please register again.'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Check if OTP is expired
        from django.utils import timezone
        if email_otp.expires_at < timezone.now():
            user.delete()
            return Response({'error': 'OTP has expired. Please register again.'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Verify OTP
        if email_otp.otp != otp:
            user.delete()
            return Response({'error': 'Invalid OTP. Please register again.'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Mark email as verified
        email_otp.is_verified = True
        email_otp.save()
        user.is_email_verified = True
        user.save()

        return Response({'message': 'Email verified successfully'})

class PhoneVerificationView(APIView):
    def post(self, request):
        user = request.user
        phone = request.data.get('phone')

        if not phone:
            return Response({'error': 'Phone number is required'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Generate 6 digit OTP
        import random
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])

        # Set expiry time to 10 minutes from now
        from django.utils import timezone
        import datetime
        expires_at = timezone.now() + datetime.timedelta(minutes=10)

        # Create PhoneOTP record
        PhoneOTP.objects.create(
            user=user,
            phone=phone,
            otp=otp,
            expires_at=expires_at
        )

        # Print OTP to terminal for development
        print(f"Phone verification OTP for {phone}: {otp}")

        return Response({'message': 'OTP sent successfully'})

    def put(self, request):
        user = request.user
        phone = request.data.get('phone')
        otp = request.data.get('otp')

        if not phone or not otp:
            return Response({'error': 'Phone number and OTP are required'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Get latest OTP record
        phone_otp = PhoneOTP.objects.filter(
            user=user,
            phone=phone,
            is_verified=False
        ).order_by('-created_at').first()

        if not phone_otp:
            user.delete()
            return Response({'error': 'No OTP found for this phone number. Please register again.'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Check if OTP is expired
        from django.utils import timezone
        if phone_otp.expires_at < timezone.now():
            user.delete()
            return Response({'error': 'OTP has expired. Please register again.'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Verify OTP
        if phone_otp.otp != otp:
            user.delete()
            return Response({'error': 'Invalid OTP. Please register again.'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Mark phone as verified
        phone_otp.is_verified = True
        phone_otp.save()
        user.is_phone_verified = True
        user.save()

        return Response({'message': 'Phone number verified successfully'})
