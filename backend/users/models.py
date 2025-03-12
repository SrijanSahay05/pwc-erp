from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('applicant', 'Applicant'),
    ]
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, db_index=True)
    email = models.EmailField(unique=True, db_index=True) 
    phone = models.PositiveIntegerField(unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user_type', 'email']),
        ]

class Application(models.Model):
    APPLICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
    ]
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, db_index=True)
    application_number = models.PositiveIntegerField(unique=True, db_index=True)
    form_number = models.PositiveIntegerField(unique=True, db_index=True)
    application_status = models.CharField(max_length=10, choices=APPLICATION_STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['application_status', 'created_at']),
        ]

class PersonalInfo(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, db_index=True)
    profile_image = models.ImageField(upload_to='user_profile_images/')
    dob = models.DateField(db_index=True)
    gender = models.CharField(max_length=10)
    nationality = models.CharField(max_length=100)
    religion = models.CharField(max_length=100)
    aadhar_card = models.PositiveIntegerField(unique=True, db_index=True)
    father_name = models.CharField(max_length=100)
    father_qualification = models.CharField(max_length=100)
    father_occupation = models.CharField(max_length=100)
    father_contact = models.PositiveIntegerField(unique=True, db_index=True)
    mother_name = models.CharField(max_length=100)
    mother_qualification = models.CharField(max_length=100)
    mother_occupation = models.CharField(max_length=100)
    mother_contact = models.PositiveIntegerField(unique=True, db_index=True)
    guardian_name = models.CharField(max_length=100)
    guardian_relation = models.CharField(max_length=100)
    guardian_occupation = models.CharField(max_length=100)
    guardian_contact = models.PositiveIntegerField(unique=True, db_index=True)
    permanentAddress_Country = models.CharField(max_length=100)
    permanentAddress_State = models.CharField(max_length=100)
    permanentAddress_City = models.CharField(max_length=100)
    permanentAddress_PinCode = models.PositiveIntegerField(unique=True, db_index=True)
    permanentAddress_Address = models.TextField()
    is_same_as_permanentAddress = models.BooleanField(default=False)
    currentAddress_Country = models.CharField(max_length=100)
    currentAddress_State = models.CharField(max_length=100)
    currentAddress_City = models.CharField(max_length=100)
    currentAddress_PinCode = models.PositiveIntegerField(unique=True, db_index=True)
    currentAddress_Address = models.TextField()
    blood_group = models.CharField(max_length=10)
    casteCategory = models.CharField(max_length=100, db_index=True)
    caste = models.CharField(max_length=100)
    caste_or_ews_certificate_issued_by = models.CharField(max_length=100)
    caste_or_ews_certificate_number = models.PositiveIntegerField(unique=True, db_index=True)
    caste_or_ews_certificate_image = models.ImageField(upload_to='caste_or_ews_certificates/')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['casteCategory', 'created_at']),
        ]

class EducationInfo(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, db_index=True)
    is_appearing = models.BooleanField(default=False)
    intermediate_school_name = models.CharField(max_length=100)
    intermediate_school_board = models.CharField(max_length=100)
    intermdiate_grade = models.CharField(max_length=100)
    intermediaate_roll_number = models.PositiveIntegerField(unique=True, db_index=True)
    intermediate_obtained_marks = models.PositiveIntegerField()
    intermediate_total_marks = models.PositiveIntegerField()
    intermediate_percentage = models.FloatField(db_index=True)
    intermediate_year_of_passing = models.PositiveIntegerField(db_index=True)
    intermediate_certificate_image = models.ImageField(upload_to='intermediate_certificates/')
    lastappearingexam_institution_name = models.CharField(max_length=100)
    lastappearingexam_place = models.CharField(max_length=100)
    lastappearingexam_board = models.CharField(max_length=100)
    lastappearingexam_year_of_passing = models.PositiveIntegerField(db_index=True)
    lastappearingexam_marksheet_image = models.ImageField(upload_to='lastappearingexam_marksheets/')
    EXTRA_CURRICULAR_CHOICES = [
        ('NCC', 'NCC'),
        ('LITERACY', 'Literacy Program'),
        ('NSS', 'NSS'),
        ('ATHLETICS', 'Athletics'),
        ('CULTURAL', 'Cultural Activity'),
        ('ENVIRONMENT', 'Environment Protection Program'),
        ('GAMES', 'Games')
    ]
    extra_curricular_activities = models.CharField(
        max_length=100,
        choices=EXTRA_CURRICULAR_CHOICES,
        blank=True,
        help_text="Enter comma separated values for multiple activities",
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_activities(self, activities):
        if isinstance(activities, list):
            self.extra_curricular_activities = ','.join(activities)

    def get_activities(self):
        if self.extra_curricular_activities:
            return self.extra_curricular_activities.split(',')
        return []

    class Meta:
        indexes = [
            models.Index(fields=['intermediate_percentage', 'intermediate_year_of_passing']),
            models.Index(fields=['extra_curricular_activities', 'created_at']),
        ]
