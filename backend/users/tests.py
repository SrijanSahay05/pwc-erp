# # backend/users/tests.py
# from rest_framework.test import APITestCase
# from django.urls import reverse, resolve
# from rest_framework import status
# from .models import CustomUser
# from django.test import SimpleTestCase
# from .views import RegisterView, LoginView, EmailVerificationView, PhoneVerificationView
# from .serializers import CustomUserSerializer

# class UserTests(APITestCase):

#     def test_register_user(self):
#         url = reverse('register')
#         data = {
#             'username': 'testuser',
#             'first_name': 'Test',
#             'last_name': 'User',
#             'password': 'password123',
#             'password2': 'password123',
#             'email': 'testuser@example.com',
#             'phone': '1234567890',
#             'user_type': 'student'
#         }
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)

#     def test_login_user(self):
#         # First, create a user
#         user = CustomUser.objects.create_user(
#             username='testuser',
#             password='password123',
#             email='testuser@example.com',
#             phone='1234567890',
#             user_type='student'
#         )
#         user.is_email_verified = True
#         user.is_phone_verified = True
#         user.save()

#         # Now, test login
#         url = reverse('login')
#         data = {'username': 'testuser', 'password': 'password123'}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     # Add more tests for other views like EmailVerificationView, PhoneVerificationView, etc.

# class UrlTests(SimpleTestCase):

#     def test_register_url_resolves(self):
#         url = reverse('register')
#         self.assertEqual(resolve(url).func.view_class, RegisterView)

#     def test_login_url_resolves(self):
#         url = reverse('login')
#         self.assertEqual(resolve(url).func.view_class, LoginView)

#     # Add more tests for other URLs

# class SerializerTests(APITestCase):

#     def test_custom_user_serializer(self):
#         data = {
#             'username': 'testuser',
#             'first_name': 'Test',
#             'last_name': 'User',
#             'password': 'password123',
#             'password2': 'password123',
#             'email': 'testuser@example.com',
#             'phone': '1234567890',
#             'user_type': 'student'
#         }
#         serializer = CustomUserSerializer(data=data)
#         self.assertTrue(serializer.is_valid())

#     # Add more tests for other serializers