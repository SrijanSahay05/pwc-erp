# API Guide <br><br>

## 1. Register Endpoint <br>
### POST REQUEST <br>
POST http://localhost:8000/api/users/register/ <br>
-H "Content-Type: application/json" <br>
-d '{ <br>
    "first_name": "<string>", <br>
    "last_name": "<string>", <br>
    "username": "<string>", <br>
    "email": "<string>", <br>
    "phone": "<integer>", <br>   
    "user_type": "<string>",  // e.g., "admin", "applicant", use "applicant" as default value <br>
    "password": "<string>", <br>
    "password2": "<string>" <br>
}' <br><br>

### RESPONSE <br>
{ <br>
  "user": { <br>
    "id": "<integer>", <br>
    "username": "<string>", <br>
    "first_name": "<string>", <br>
    "last_name": "<string>", <br>
    "email": "<string>", <br>
    "phone": "<integer>", <br>
    "user_type": "<string>",  // e.g., "admin", "applicant" <br>
    "created_at": "<datetime>", // e.g., "2025-03-14T01:04:14.319043+05:30" <br>
    "updated_at": "<datetime>"  // e.g., "2025-03-14T01:04:14.319052+05:30" <br>
  }, <br>
  "refresh": "<string>",  // JWT refresh token <br>
  "access": "<string>"     // JWT access token <br>
} <br><br>

## 2. Login Endpoint <br>
### POST REQUEST <br>
POST http://localhost:8000/api/users/login/ <br>
-H "Content-Type: application/json" <br>
-d '{ <br>
    "username": "<string>", <br>
    "password": "<string>" <br>
}' <br><br>

### RESPONSE <br>
{ <br>
  "user": { <br>
    "id": "<integer>", <br>
    "username": "<string>", <br>
    "first_name": "<string>", <br>
    "last_name": "<string>", <br>
    "email": "<string>", <br>
    "phone": "<integer>", <br>
    "user_type": "<string>",  // e.g., "admin", "applicant" <br>
    "created_at": "<datetime>", // e.g., "2025-03-14T01:04:14.319043+05:30" <br>
    "updated_at": "<datetime>"  // e.g., "2025-03-14T01:13:16.038972+05:30" <br>
  }, <br>
  "refresh": "<string>",  // JWT refresh token <br>
  "access": "<string>"     // JWT access token <br>
} <br><br>

## 3. Token Refresh <br><br>

## 4. Email Verification <br>
### POST REQUEST <br>
POST http://localhost:8000/api/users/verify-email/ <br>
-H "Content-Type: application/json" <br>
-d '{"email":"<string>"}' <br><br>
### RESPONSE <br>
{"message":"OTP sent successfully"} <br><br>

### PUT REQUEST <br>
PUT http://localhost:8000/api/users/verify-email/ <br>
-H "Content-Type: application/json" <br>
-d '{ <br>
  "email": "<string>", <br>
  "otp": "<string>" <br>
}' <br><br>
### RESPONSE <br>
{"message":"Email verified successfully"} <br><br>

## 5. Phone Verification <br>
### POST REQUEST <br>
POST http://localhost:8000/api/users/verify-phone/ <br>
-H "Content-Type: application/json" <br>
-d '{"phone":"<integer>"}' // This might be a <string> <br><br>
### RESPONSE <br>
{"message":"OTP sent successfully"} <br><br>

### PUT REQUEST <br>
PUT http://localhost:8000/api/users/verify-phone/ <br>
-H "Content-Type: application/json" <br>
-d '{ <br>
  "phone": "<string>", <br>
  "otp": "<string>" <br>
}' <br><br>
### RESPONSE <br>
{"message":"Phone verified successfully"} <br><br>

## 6. Reset Password <br>
### POST REQUEST <br>
POST http://localhost:8000/api/users/reset-password/ <br>
-H "Content-Type: application/json" <br>
-d '{ <br>
    "email": "<string>", <br>
}' <br><br>
### RESPONSE <br>
{"message":"Password reset OTP sent successfully"} <br><br>

### PUT REQUEST <br>
PUT http://localhost:8000/api/users/reset-password/ <br>
-H "Content-Type: application/json" <br>
-d '{ <br>
  "email": "<string>", <br>
  "otp": "<string>", <br>
  "new_password": "<string>" <br>
}' <br><br>
