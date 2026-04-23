import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { CurrentUser, Profile } from '../models/user';

interface LoginResponse {
  access: string;
  refresh: string;
  user: CurrentUser;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  phone_number: string;
  course: string;
}

export interface ProfilePayload {
  email: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  phone_number: string;
  course: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api';
  private readonly tokenKey = 'lost-found-token';
  private readonly refreshKey = 'lost-found-refresh-token';
  private readonly userKey = 'lost-found-user';
  private readonly http = inject(HttpClient);
  private readonly currentUserState = signal<CurrentUser | null>(this.readStoredUser());

  readonly currentUser = computed(() => this.currentUserState());

  constructor() {
    this.restoreSession();
  }

  login(payload: LoginPayload): Observable<{ success: boolean; message: string }> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/`, payload).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.access);
        localStorage.setItem(this.refreshKey, response.refresh);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        this.currentUserState.set(response.user);
      }),
      map(() => ({ success: true, message: '' })),
      catchError(() => of({ success: false, message: 'Wrong username or password.' }))
    );
  }

  register(payload: RegisterPayload): Observable<{ success: boolean; message: string }> {
    return this.http.post<CurrentUser>(`${this.apiUrl}/auth/register/`, payload).pipe(
      map(() => ({ success: true, message: '' })),
      catchError(() => of({ success: false, message: 'Unable to register with these details.' }))
    );
  }

  logout(): Observable<void> {
    const refresh = localStorage.getItem(this.refreshKey);

    if (!refresh) {
      this.clearSession();
      return of(void 0);
    }

    return this.http.post<void>(`${this.apiUrl}/auth/logout/`, { refresh }).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(void 0);
      })
    );
  }

  getProfile(): Observable<Profile> {
    return this.http.get<{
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      patronymic: string;
      phone_number: string;
      course: string;
      role: 'admin' | 'user';
      full_name: string;
    }>(`${this.apiUrl}/profile/`).pipe(
      map((profile) => ({
        username: profile.username,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        patronymic: profile.patronymic,
        phoneNumber: profile.phone_number,
        course: profile.course,
        role: profile.role,
        fullName: profile.full_name
      }))
    );
  }

  updateProfile(payload: ProfilePayload): Observable<Profile> {
    return this.http.put<{
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      patronymic: string;
      phone_number: string;
      course: string;
      role: 'admin' | 'user';
      full_name: string;
    }>(`${this.apiUrl}/profile/`, payload).pipe(
      map((profile) => {
        const currentUser = this.currentUserState();
        if (currentUser) {
          this.currentUserState.set({
            ...currentUser,
            fullName: profile.full_name,
            email: profile.email,
            phoneNumber: profile.phone_number,
            course: profile.course
          });
        }

        return {
          username: profile.username,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          patronymic: profile.patronymic,
          phoneNumber: profile.phone_number,
          course: profile.course,
          role: profile.role,
          fullName: profile.full_name
        };
      })
    );
  }

  isLoggedIn(): boolean {
    return Boolean(localStorage.getItem(this.tokenKey));
  }

  isAdmin(): boolean {
    return this.currentUserState()?.role === 'admin';
  }

  getDisplayName(): string {
    return this.currentUserState()?.username || 'Guest';
  }

  private restoreSession(): void {
    if (!localStorage.getItem(this.tokenKey)) {
      return;
    }

    this.http.get<CurrentUser>(`${this.apiUrl}/auth/me/`).pipe(
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    ).subscribe((user) => {
      if (user) {
        this.currentUserState.set(user);
      }
    });
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.userKey);
    this.currentUserState.set(null);
  }

  private readStoredUser(): CurrentUser | null {
    const rawUser = localStorage.getItem(this.userKey);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as CurrentUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
