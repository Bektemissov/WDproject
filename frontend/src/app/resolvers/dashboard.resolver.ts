import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { Item } from '../models/item';
import { Profile } from '../models/user';
import { AuthService } from '../services/auth.service';
import { ItemsService } from '../services/items.service';

export interface ProfilePageData {
  profile: Profile | null;
  myItems: Item[];
}

export interface ModerationPageData {
  pendingItems: Item[];
  publishedItems: Item[];
}

export const profileResolver: ResolveFn<ProfilePageData> = () => {
  const authService = inject(AuthService);
  const itemsService = inject(ItemsService);

  return forkJoin({
    profile: authService.getProfile().pipe(catchError(() => of(null))),
    myItems: itemsService.getMyItems().pipe(catchError(() => of([])))
  });
};

export const moderationResolver: ResolveFn<ModerationPageData> = () => {
  const itemsService = inject(ItemsService);

  return forkJoin({
    pendingItems: itemsService.getPendingItems().pipe(catchError(() => of([]))),
    publishedItems: itemsService.getPublishedItems().pipe(catchError(() => of([])))
  });
};
