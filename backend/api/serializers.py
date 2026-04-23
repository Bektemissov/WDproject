from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import CampusLocation, Category, Item, UserProfile


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs['username'], password=attrs['password'])
        if user is None:
            raise serializers.ValidationError('Invalid username or password.')
        attrs['user'] = user
        return attrs


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    patronymic = serializers.CharField(max_length=100, allow_blank=True)
    phone_number = serializers.CharField(max_length=30)
    course = serializers.ChoiceField(choices=[str(number) for number in range(1, 7)])

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already used.')
        return value

    def create(self, validated_data):
        patronymic = validated_data.pop('patronymic', '')
        phone_number = validated_data.pop('phone_number')
        course = validated_data.pop('course')
        password = validated_data.pop('password')

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        user.profile.patronymic = patronymic
        user.profile.phone_number = phone_number
        user.profile.course = course
        user.profile.role = 'user'
        user.profile.save()

        return user


class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    role = serializers.CharField()
    full_name = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField()
    course = serializers.CharField()


class ProfileSerializer(serializers.Serializer):
    username = serializers.CharField(read_only=True)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    patronymic = serializers.CharField(max_length=100, allow_blank=True)
    phone_number = serializers.CharField(max_length=30)
    course = serializers.ChoiceField(choices=[str(number) for number in range(1, 7)])
    role = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)

    def update(self, instance: UserProfile, validated_data):
        user = instance.user
        user.email = validated_data['email']
        user.first_name = validated_data['first_name']
        user.last_name = validated_data['last_name']
        user.save()

        instance.patronymic = validated_data['patronymic']
        instance.phone_number = validated_data['phone_number']
        instance.course = validated_data['course']
        instance.save()
        return instance


class ModerationActionSerializer(serializers.Serializer):
    moderation_status = serializers.ChoiceField(choices=['approved', 'rejected'])
    moderator_comment = serializers.CharField(max_length=255, allow_blank=True, required=False)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class CampusLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampusLocation
        fields = ['id', 'name']


class ItemSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name', read_only=True)
    location = serializers.CharField(source='location.name', read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(source='category', queryset=Category.objects.all(), write_only=True)
    location_id = serializers.PrimaryKeyRelatedField(source='location', queryset=CampusLocation.objects.all(), write_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    owner_first_name = serializers.CharField(source='owner.first_name', read_only=True)
    owner_last_name = serializers.CharField(source='owner.last_name', read_only=True)
    owner_patronymic = serializers.CharField(source='owner.profile.patronymic', read_only=True)
    owner_phone_number = serializers.CharField(source='owner.profile.phone_number', read_only=True)
    owner_course = serializers.CharField(source='owner.profile.course', read_only=True)
    owner_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            'id',
            'title',
            'description',
            'type',
            'status',
            'moderation_status',
            'moderator_comment',
            'category',
            'location',
            'category_id',
            'location_id',
            'owner_username',
            'owner_email',
            'owner_first_name',
            'owner_last_name',
            'owner_patronymic',
            'owner_phone_number',
            'owner_course',
            'owner_full_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['status', 'moderation_status', 'moderator_comment']

    def get_owner_full_name(self, obj: Item) -> str:
        return obj.owner.profile.full_name
