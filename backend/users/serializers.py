from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, Application, PersonalInfo, EducationInfo

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'first_name', 'last_name', 'password', 'password2', 'email', 'phone', 'user_type', 'created_at', 'updated_at')
        extra_kwargs = {
            'username': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'phone': {'required': True},
            'user_type': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            password2 = validated_data.pop('password2', None)
            instance.set_password(password)
        return super().update(instance, validated_data)

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('id', 'user', 'application_number', 'form_number', 'application_status', 'created_at', 'updated_at')
        extra_kwargs = {
            'application_number': {'required': True},
            'form_number': {'required': True},
            'application_status': {'required': True}
        }

    def validate(self, attrs):
        if attrs.get('application_status') not in ['pending', 'approved']:
            raise serializers.ValidationError({"application_status": "Invalid application status"})
        return attrs

    def create(self, validated_data):
        application = Application.objects.create(**validated_data)
        return application

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

class PersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalInfo
        fields = (
            'id', 'user', 'profile_image', 'dob', 'gender', 'nationality', 'religion',
            'aadhar_card', 'father_name', 'father_qualification', 'father_occupation',
            'father_contact', 'mother_name', 'mother_qualification', 'mother_occupation',
            'mother_contact', 'guardian_name', 'guardian_relation', 'guardian_occupation',
            'guardian_contact', 'permanentAddress_Country', 'permanentAddress_State',
            'permanentAddress_City', 'permanentAddress_PinCode', 'permanentAddress_Address',
            'is_same_as_permanentAddress', 'currentAddress_Country', 'currentAddress_State',
            'currentAddress_City', 'currentAddress_PinCode', 'currentAddress_Address',
            'blood_group', 'casteCategory', 'caste', 'caste_or_ews_certificate_issued_by',
            'caste_or_ews_certificate_number', 'caste_or_ews_certificate_image',
            'created_at', 'updated_at'
        )
        extra_kwargs = {
            'user': {'required': True},
            'profile_image': {'required': True},
            'dob': {'required': True},
            'gender': {'required': True},
            'nationality': {'required': True},
            'religion': {'required': True},
            'aadhar_card': {'required': True},
            'father_name': {'required': True},
            'father_contact': {'required': True},
            'mother_name': {'required': True},
            'mother_contact': {'required': True},
            'permanentAddress_Country': {'required': True},
            'permanentAddress_State': {'required': True},
            'permanentAddress_City': {'required': True},
            'permanentAddress_PinCode': {'required': True},
            'permanentAddress_Address': {'required': True},
            'blood_group': {'required': True},
            'casteCategory': {'required': True},
            'caste': {'required': True}
        }

    def validate(self, attrs):
        # Validate gender choices
        if attrs.get('gender') not in ['female', 'transgender']:
            raise serializers.ValidationError({"gender": "Invalid gender choice"})

        # Validate blood group choices 
        valid_blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
        if attrs.get('blood_group') not in valid_blood_groups:
            raise serializers.ValidationError({"blood_group": "Invalid blood group"})

        return attrs

    def create(self, validated_data):
        personal_info = PersonalInfo.objects.create(**validated_data)
        return personal_info

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
