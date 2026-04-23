from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CampusLocation, Category, Item, UserProfile
from .serializers import (
    CampusLocationSerializer,
    CategorySerializer,
    ItemSerializer,
    LoginSerializer,
    LogoutSerializer,
    ModerationActionSerializer,
    ProfileSerializer,
    RegisterSerializer,
    UserSerializer,
)


def is_admin(user: User) -> bool:
    return hasattr(user, 'profile') and user.profile.role == 'admin'


def serialize_user(user: User) -> dict:
    return UserSerializer(
        {
            'id': user.id,
            'username': user.username,
            'role': user.profile.role if hasattr(user, 'profile') else 'user',
            'full_name': user.profile.full_name if hasattr(user, 'profile') else user.username,
            'email': user.email,
            'phone_number': user.profile.phone_number if hasattr(user, 'profile') else '',
            'course': user.profile.course if hasattr(user, 'profile') else '',
        }
    ).data


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(serialize_user(user), status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = serializer.validated_data['user']
    refresh = RefreshToken.for_user(user)

    return Response(
        {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': serialize_user(user),
        }
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    serializer = LogoutSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        token = RefreshToken(serializer.validated_data['refresh'])
        token.blacklist()
    except Exception:
        return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'detail': 'Logged out successfully.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(serialize_user(request.user))


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    profile: UserProfile = request.user.profile

    if request.method == 'GET':
        serializer = ProfileSerializer(
            {
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'patronymic': profile.patronymic,
                'phone_number': profile.phone_number,
                'course': profile.course,
                'role': profile.role,
                'full_name': profile.full_name,
            }
        )
        return Response(serializer.data)

    serializer = ProfileSerializer(instance=profile, data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(
        {
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'patronymic': profile.patronymic,
            'phone_number': profile.phone_number,
            'course': profile.course,
            'role': profile.role,
            'full_name': profile.full_name,
        }
    )


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(CategorySerializer(Category.objects.all(), many=True).data)


class LocationListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(CampusLocationSerializer(CampusLocation.objects.all(), many=True).data)


class PublicItemListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = Item.objects.select_related('category', 'location', 'owner__profile').filter(moderation_status='approved')
        return Response(ItemSerializer(queryset, many=True).data)


class MyItemListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Item.objects.select_related('category', 'location', 'owner__profile').filter(owner=request.user)
        return Response(ItemSerializer(queryset, many=True).data)

    def post(self, request):
        serializer = ItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, item_id: int):
        try:
            return Item.objects.select_related('category', 'location', 'owner__profile').get(id=item_id)
        except Item.DoesNotExist:
            return None

    def can_view(self, request, item: Item) -> bool:
        if item.moderation_status == 'approved':
            return True
        if request.user == item.owner or is_admin(request.user):
            return True
        return False

    def get(self, request, item_id: int):
        item = self.get_object(item_id)
        if item is None:
            return Response({'detail': 'Announcement not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not self.can_view(request, item):
            return Response({'detail': 'You cannot view this announcement yet.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(ItemSerializer(item).data)

    def put(self, request, item_id: int):
        item = self.get_object(item_id)
        if item is None:
            return Response({'detail': 'Announcement not found.'}, status=status.HTTP_404_NOT_FOUND)
        if request.user != item.owner and not is_admin(request.user):
            return Response({'detail': 'You cannot edit this announcement.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ItemSerializer(item, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(
            owner=item.owner,
            moderation_status='pending' if request.user == item.owner and not is_admin(request.user) else item.moderation_status,
            moderator_comment='' if request.user == item.owner and not is_admin(request.user) else item.moderator_comment,
            status=item.status,
        )
        return Response(serializer.data)

    def delete(self, request, item_id: int):
        item = self.get_object(item_id)
        if item is None:
            return Response({'detail': 'Announcement not found.'}, status=status.HTTP_404_NOT_FOUND)
        if request.user != item.owner and not is_admin(request.user):
            return Response({'detail': 'You cannot delete this announcement.'}, status=status.HTTP_403_FORBIDDEN)

        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminPendingItemListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'detail': 'Only admin can view moderation queue.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = Item.objects.select_related('category', 'location', 'owner__profile').filter(moderation_status='pending')
        return Response(ItemSerializer(queryset, many=True).data)


class AdminPublishedItemListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'detail': 'Only admin can view published announcements.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = Item.objects.select_related('category', 'location', 'owner__profile').filter(moderation_status='approved')
        return Response(ItemSerializer(queryset, many=True).data)


class ItemModerationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, item_id: int):
        if not is_admin(request.user):
            return Response({'detail': 'Only admin can moderate announcements.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ModerationActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            item = Item.objects.get(id=item_id)
        except Item.DoesNotExist:
            return Response({'detail': 'Announcement not found.'}, status=status.HTTP_404_NOT_FOUND)

        item.moderation_status = serializer.validated_data['moderation_status']
        item.moderator_comment = serializer.validated_data.get('moderator_comment', '')
        if item.moderation_status == 'rejected':
            item.status = 'closed'
        item.save()
        return Response(ItemSerializer(item).data)


class ItemToggleStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, item_id: int):
        try:
            item = Item.objects.get(id=item_id)
        except Item.DoesNotExist:
            return Response({'detail': 'Announcement not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user != item.owner and not is_admin(request.user):
            return Response({'detail': 'You cannot change the status of this announcement.'}, status=status.HTTP_403_FORBIDDEN)

        item.status = 'closed' if item.status == 'open' else 'open'
        item.save()
        return Response(ItemSerializer(item).data)
