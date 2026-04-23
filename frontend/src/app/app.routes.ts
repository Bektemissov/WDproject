import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { CreateAnnouncementPageComponent } from './pages/create-announcement-page/create-announcement-page.component';
import { ItemDetailsPageComponent } from './pages/item-details-page/item-details-page.component';
import { ItemsPageComponent } from './pages/items-page/items-page.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ModerationPageComponent } from './pages/moderation-page/moderation-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { moderationResolver, profileResolver } from './resolvers/dashboard.resolver';
import { itemResolver, itemsResolver } from './resolvers/items.resolver';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: 'register',
    component: RegisterPageComponent
  },
  {
    path: 'items',
    canActivate: [authGuard],
    component: ItemsPageComponent,
    resolve: {
      items: itemsResolver
    }
  },
  {
    path: 'items/new',
    canActivate: [authGuard],
    component: CreateAnnouncementPageComponent
  },
  {
    path: 'items/:id',
    canActivate: [authGuard],
    component: ItemDetailsPageComponent,
    resolve: {
      item: itemResolver
    }
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    component: ProfilePageComponent,
    resolve: {
      dashboardData: profileResolver
    }
  },
  {
    path: 'moderation',
    canActivate: [authGuard, adminGuard],
    component: ModerationPageComponent,
    resolve: {
      moderationData: moderationResolver
    }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
