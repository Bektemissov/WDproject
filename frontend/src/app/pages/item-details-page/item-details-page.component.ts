import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Item } from '../../models/item';
import { AuthService } from '../../services/auth.service';
import { ItemsService } from '../../services/items.service';

@Component({
  selector: 'app-item-details-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './item-details-page.component.html',
  styleUrl: './item-details-page.component.css'
})
export class ItemDetailsPageComponent {
  protected item: Item | null = null;
  protected errorMessage = '';
  protected isLoading = true;

  private readonly route = inject(ActivatedRoute);
  protected readonly authService = inject(AuthService);
  private readonly itemsService = inject(ItemsService);

  constructor() {
    this.route.data.subscribe((data) => {
      this.item = (data['item'] as Item | null) ?? null;
      this.errorMessage = this.item ? '' : 'Unable to load announcement details.';
      this.isLoading = false;
    });
  }

  protected toggleStatus(): void {
    if (!this.item) {
      return;
    }

    this.itemsService.toggleStatus(this.item.id).subscribe((item) => {
      this.item = item;
    });
  }

  protected deleteItem(): void {
    if (!this.item) {
      return;
    }

    this.itemsService.deleteItem(this.item.id).subscribe(() => {
      this.item = null;
      this.errorMessage = 'Announcement deleted.';
    });
  }

  protected canManage(): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser || !this.item) {
      return false;
    }

    return currentUser.role === 'admin' || currentUser.username === this.item.owner.username;
  }

  protected moderationLabel(): string {
    if (!this.item) {
      return '';
    }

    if (this.item.moderationStatus === 'pending') {
      return 'Under review';
    }

    if (this.item.moderationStatus === 'rejected') {
      return 'Rejected';
    }

    return this.item.status === 'closed' ? 'Closed' : 'Active';
  }
}
