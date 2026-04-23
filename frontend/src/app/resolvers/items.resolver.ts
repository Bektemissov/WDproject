import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Item } from '../models/item';
import { ItemsService } from '../services/items.service';

export const itemsResolver: ResolveFn<Item[]> = () => {
  return inject(ItemsService).getPublicItems().pipe(catchError(() => of([])));
};

export const itemResolver: ResolveFn<Item | null> = (route) => {
  const id = Number(route.paramMap.get('id'));

  if (!id) {
    return of(null);
  }

  return inject(ItemsService).getItemById(id).pipe(catchError(() => of(null)));
};
