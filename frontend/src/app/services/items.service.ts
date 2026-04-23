import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CategoryOption } from '../models/category';
import { Item } from '../models/item';
import { LocationOption } from '../models/location';

export interface ItemPayload {
  title: string;
  description: string;
  type: 'lost' | 'found';
  category_id: number | null;
  location_id: number | null;
}

export interface ModerationPayload {
  moderation_status: 'approved' | 'rejected';
  moderator_comment: string;
}

interface ItemDto {
  id: number;
  title: string;
  description: string;
  type: 'lost' | 'found';
  status: 'open' | 'closed';
  moderation_status: 'pending' | 'approved' | 'rejected';
  moderator_comment: string;
  category: string;
  location: string;
  owner_username: string;
  owner_email: string;
  owner_phone_number: string;
  owner_course: string;
  owner_full_name: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api';
  private readonly http = inject(HttpClient);

  getPublicItems(): Observable<Item[]> {
    return this.http.get<ItemDto[]>(`${this.apiUrl}/items/`).pipe(map((items) => items.map((item) => this.mapItem(item))));
  }

  getMyItems(): Observable<Item[]> {
    return this.http.get<ItemDto[]>(`${this.apiUrl}/items/my/`).pipe(map((items) => items.map((item) => this.mapItem(item))));
  }

  getPendingItems(): Observable<Item[]> {
    return this.http.get<ItemDto[]>(`${this.apiUrl}/items/pending/`).pipe(map((items) => items.map((item) => this.mapItem(item))));
  }

  getPublishedItems(): Observable<Item[]> {
    return this.http.get<ItemDto[]>(`${this.apiUrl}/items/published/`).pipe(map((items) => items.map((item) => this.mapItem(item))));
  }

  getItemById(id: number): Observable<Item> {
    return this.http.get<ItemDto>(`${this.apiUrl}/items/${id}/`).pipe(map((item) => this.mapItem(item)));
  }

  createItem(payload: ItemPayload): Observable<Item> {
    return this.http.post<ItemDto>(`${this.apiUrl}/items/my/`, payload).pipe(map((item) => this.mapItem(item)));
  }

  updateItem(id: number, payload: ItemPayload): Observable<Item> {
    return this.http.put<ItemDto>(`${this.apiUrl}/items/${id}/`, payload).pipe(map((item) => this.mapItem(item)));
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${id}/`);
  }

  moderateItem(id: number, payload: ModerationPayload): Observable<Item> {
    return this.http.post<ItemDto>(`${this.apiUrl}/items/${id}/moderate/`, payload).pipe(map((item) => this.mapItem(item)));
  }

  toggleStatus(id: number): Observable<Item> {
    return this.http.post<ItemDto>(`${this.apiUrl}/items/${id}/toggle-status/`, {}).pipe(map((item) => this.mapItem(item)));
  }

  getCategories(): Observable<CategoryOption[]> {
    return this.http.get<CategoryOption[]>(`${this.apiUrl}/categories/`);
  }

  getLocations(): Observable<LocationOption[]> {
    return this.http.get<LocationOption[]>(`${this.apiUrl}/locations/`);
  }

  private mapItem(item: ItemDto): Item {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type,
      status: item.status,
      moderationStatus: item.moderation_status,
      moderatorComment: item.moderator_comment,
      category: item.category,
      location: item.location,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      owner: {
        username: item.owner_username,
        fullName: item.owner_full_name,
        email: item.owner_email,
        phoneNumber: item.owner_phone_number,
        course: item.owner_course
      }
    };
  }
}
