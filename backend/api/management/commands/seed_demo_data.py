from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from api.models import CampusLocation, Category, Item


class Command(BaseCommand):
    help = 'Create demo users, profiles, categories, locations, and announcements.'

    def handle(self, *args, **options):
        categories = ['Documents', 'Electronics', 'Bags', 'Accessories']
        locations = ['Main entrance', 'Library', 'Room 312', 'Cafeteria']

        for name in categories:
            Category.objects.get_or_create(name=name)

        for name in locations:
            CampusLocation.objects.get_or_create(name=name)

        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'is_staff': True,
                'is_superuser': True,
                'email': 'admin@kbtu.local',
                'first_name': 'Campus',
                'last_name': 'Admin',
            }
        )
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.email = 'admin@kbtu.local'
        admin_user.first_name = 'Campus'
        admin_user.last_name = 'Admin'
        admin_user.set_password('admin123')
        admin_user.save()
        admin_user.profile.role = 'admin'
        admin_user.profile.patronymic = 'Moderator'
        admin_user.profile.phone_number = '+7 700 000 00 01'
        admin_user.profile.course = '6'
        admin_user.profile.save()

        student_user, _ = User.objects.get_or_create(
            username='student',
            defaults={
                'email': 'student@kbtu.local',
                'first_name': 'Aruzhan',
                'last_name': 'Sarsenova',
            }
        )
        student_user.email = 'student@kbtu.local'
        student_user.first_name = 'Aruzhan'
        student_user.last_name = 'Sarsenova'
        student_user.set_password('student123')
        student_user.save()
        student_user.profile.role = 'user'
        student_user.profile.patronymic = 'Maratovna'
        student_user.profile.phone_number = '+7 700 000 00 02'
        student_user.profile.course = '2'
        student_user.profile.save()

        documents = Category.objects.get(name='Documents')
        bags = Category.objects.get(name='Bags')
        electronics = Category.objects.get(name='Electronics')

        entrance = CampusLocation.objects.get(name='Main entrance')
        room = CampusLocation.objects.get(name='Room 312')
        library = CampusLocation.objects.get(name='Library')

        Item.objects.update_or_create(
            title='Lost student ID card',
            defaults={
                'description': 'Blue KBTU student card, probably dropped near the main entrance after the evening lecture.',
                'type': 'lost',
                'status': 'open',
                'moderation_status': 'approved',
                'category': documents,
                'location': entrance,
                'owner': student_user,
            }
        )

        Item.objects.update_or_create(
            title='Found black backpack',
            defaults={
                'description': 'Black backpack with a laptop charger inside, found in room 312 after class.',
                'type': 'found',
                'status': 'open',
                'moderation_status': 'approved',
                'category': bags,
                'location': room,
                'owner': student_user,
            }
        )

        Item.objects.update_or_create(
            title='Lost AirPods case',
            defaults={
                'description': 'White AirPods case without earphones, last seen in the library reading room.',
                'type': 'lost',
                'status': 'open',
                'moderation_status': 'pending',
                'category': electronics,
                'location': library,
                'owner': student_user,
            }
        )

        self.stdout.write(self.style.SUCCESS('Admin account ready: admin / admin123'))
        self.stdout.write(self.style.SUCCESS('User account ready: student / student123'))
        self.stdout.write(self.style.SUCCESS('Demo data seeded successfully.'))
