import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Item } from '../../models/item';
import { Profile } from '../../models/user';
import { ProfilePageData } from '../../resolvers/dashboard.resolver';
import { AuthService, ProfilePayload } from '../../services/auth.service';
import { ItemsService } from '../../services/items.service';

@Component({
  selector: 'app-profile-page',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {
  protected profile: Profile | null = null;
  protected myItems: Item[] = [];
  protected errorMessage = '';
  protected successMessage = '';
  protected form: ProfilePayload = {
    email: '',
    first_name: '',
    last_name: '',
    patronymic: '',
    phone_number: '',
    course: '1'
  };

  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly itemsService = inject(ItemsService);

  constructor() {
    this.route.data.subscribe((data) => {
      this.applyData((data['dashboardData'] as ProfilePageData | undefined) ?? { profile: null, myItems: [] });
    });
  }

  protected saveProfile(): void {
    this.authService.updateProfile(this.form).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.successMessage = 'Profile updated successfully.';
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = 'Unable to update profile.';
        this.successMessage = '';
      }
    });
  }

  protected moderationLabel(item: Item): string {
    if (item.moderationStatus === 'approved') {
      return item.status === 'closed' ? 'Closed' : 'Active';
    }

    if (item.moderationStatus === 'pending') {
      return 'Under review';
    }

    return 'Rejected';
  }

  private loadData(): void {
    forkJoin({
      profile: this.authService.getProfile(),
      myItems: this.itemsService.getMyItems()
    }).subscribe({
      next: ({ profile, myItems }) => {
        this.applyData({ profile, myItems });
      },
      error: () => {
        this.errorMessage = 'Unable to load profile data.';
      }
    });
  }

  private applyData(data: ProfilePageData): void {
    this.profile = data.profile;
    this.myItems = data.myItems;

    if (!data.profile) {
      this.errorMessage = 'Unable to load profile data.';
      return;
    }

    this.errorMessage = '';
    this.form = {
      email: data.profile.email,
      first_name: data.profile.firstName,
      last_name: data.profile.lastName,
      patronymic: data.profile.patronymic,
      phone_number: data.profile.phoneNumber,
      course: data.profile.course
    };
  }
}
