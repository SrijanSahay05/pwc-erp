# API Guide

## 1. Register Endpoint
### POST REQUEST
POST http://localhost:8000/api/users/register/
-H "Content-Type: application/json"
-d '{
    "first_name": "<string>",
    "last_name": "<string>",
    "username": "<string>",
    "email": "<string>",
    "phone": "<integer>",   
    "user_type": "<string>",  // e.g., "admin", "applicant", use "applicant" as default value
    "password": "<string>",
    "password2": "<string>"
}'


### RESPONSE
{
  "user": {
    "id": "<integer>",
    "username": "<string>",
    "first_name": "<string>",
    "last_name": "<string>",
    "email": "<string>",
    "phone": "<integer>",
    "user_type": "<string>",  // e.g., "admin", "applicant"
    "created_at": "<datetime>", // e.g., "2025-03-14T01:04:14.319043+05:30"
    "updated_at": "<datetime>"  // e.g., "2025-03-14T01:04:14.319052+05:30"
  },
  "refresh": "<string>",  // JWT refresh token
  "access": "<string>"     // JWT access token
}

## 2. Login Endpoint
### POST REQUEST
POST http://localhost:8000/api/users/login/
-H "Content-Type: application/json"
-d '{
    "username": "<string>",
    "password": "<string>"
}'

### RESPONSE
{
  "user": {
    "id": "<integer>",
    "username": "<string>",
    "first_name": "<string>",
    "last_name": "<string>",
    "email": "<string>",
    "phone": "<integer>",
    "user_type": "<string>",  // e.g., "admin", "applicant"
    "created_at": "<datetime>", // e.g., "2025-03-14T01:04:14.319043+05:30"
    "updated_at": "<datetime>"  // e.g., "2025-03-14T01:13:16.038972+05:30"
  },
  "refresh": "<string>",  // JWT refresh token
  "access": "<string>"     // JWT access token
}

## 3. Token Refresh



## 4. Email Verification 
### POST REQUEST
POST http://localhost:8000/api/users/verify-email/
-H "Content-Type: application/json"
-d '{"email":"<string>"}'
### RESPONSE 
{"message":"OTP sent successfully"}

### PUT REQUEST
PUT http://localhost:8000/api/users/verify-email/
-H "Content-Type: application/json"
-d '{
  "email": "<string>",
  "otp": "<string>"
}'
### RESPONSE
{"message":"Email verified successfully"}

## 5. Phone Verification 
POST http://localhost:8000/api/users/verify-phone/
-H "Content-Type: application/json"
-d '{"phone":"<integer>"}' // This might be a <string>
### RESPONSE
{"message":"OTP sent successfully"}

### PUT REQUEST
PUT http://localhost:8000/api/users/verify-email/
-H "Content-Type: application/json"
-d '{
  "email": "<string>",
  "otp": "<string>"
}'
### RESPONSE
{"message":"Phone verified successfully"}


## 6. Reset Password
POST http://localhost:8000/api/users/reset-password/
-H "Content-Type: application/json"
-d '{
    "email": "<string>",
}'
### RESPONSE
{"message":"Password reset OTP sent successfully"}

### PUT REQUEST
PUT http://localhost:8000/api/users/reset-password/
-H "Content-Type: application/json"
-d '{
  "email": "<string>",
  "otp": "<string>",
  "new_password": "<string>"
}'



