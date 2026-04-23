from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import UserProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance: User, created: bool, **kwargs) -> None:
    if created:
        role = 'admin' if instance.is_staff else 'user'
        UserProfile.objects.create(user=instance, role=role)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance: User, **kwargs) -> None:
    if hasattr(instance, 'profile') and instance.is_staff and instance.profile.role != 'admin':
        instance.profile.role = 'admin'
        instance.profile.save()
