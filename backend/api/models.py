from django.contrib.auth.models import User
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self) -> str:
        return self.name


class CampusLocation(models.Model):
    name = models.CharField(max_length=120, unique=True)

    def __str__(self) -> str:
        return self.name


class UserProfile(models.Model):
    ROLE_CHOICES = [('admin', 'Admin'), ('user', 'User')]
    COURSE_CHOICES = [(str(number), f'{number} course') for number in range(1, 7)]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    patronymic = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=30, blank=True)
    course = models.CharField(max_length=10, choices=COURSE_CHOICES, blank=True)

    @property
    def full_name(self) -> str:
        parts = [self.user.last_name, self.user.first_name, self.patronymic]
        return ' '.join(part for part in parts if part).strip()

    def __str__(self) -> str:
        return f'{self.user.username} ({self.role})'


class Item(models.Model):
    TYPE_CHOICES = [('lost', 'Lost'), ('found', 'Found')]
    STATUS_CHOICES = [('open', 'Open'), ('closed', 'Closed')]
    MODERATION_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='items')
    location = models.ForeignKey(CampusLocation, on_delete=models.PROTECT, related_name='items')
    title = models.CharField(max_length=150)
    description = models.TextField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    moderation_status = models.CharField(max_length=10, choices=MODERATION_CHOICES, default='pending')
    moderator_comment = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.title
