import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Item } from '../../models/item';
import { ModerationPageData } from '../../resolvers/dashboard.resolver';
import { ItemsService } from '../../services/items.service';

@Component({
  selector: 'app-moderation-page',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './moderation-page.component.html',
  styleUrl: './moderation-page.component.css'
})
export class ModerationPageComponent {
  protected pendingItems: Item[] = [];
  protected publishedItems: Item[] = [];
  protected moderatorCommentById: Record<number, string> = {};
  protected successMessage = '';
  protected errorMessage = '';

  private readonly route = inject(ActivatedRoute);
  private readonly itemsService = inject(ItemsService);

  constructor() {
    this.route.data.subscribe((data) => {
      this.applyData(
        (data['moderationData'] as ModerationPageData | undefined) ?? { pendingItems: [], publishedItems: [] }
      );
    });
  }

  protected moderate(item: Item, moderationStatus: 'approved' | 'rejected'): void {
    this.itemsService.moderateItem(item.id, {
      moderation_status: moderationStatus,
      moderator_comment: this.moderatorCommentById[item.id] ?? ''
    }).subscribe({
      next: () => {
        this.successMessage = `Announcement "${item.title}" was ${moderationStatus}.`;
        this.errorMessage = '';
        this.loadData();
      },
      error: () => {
        this.errorMessage = 'Unable to update moderation status.';
        this.successMessage = '';
      }
    });
  }

  protected toggleStatus(itemId: number): void {
    this.itemsService.toggleStatus(itemId).subscribe({
      next: () => {
        this.loadData();
        this.successMessage = 'Announcement status updated.';
      },
      error: () => {
        this.errorMessage = 'Unable to toggle announcement status.';
      }
    });
  }

  protected deleteItem(itemId: number): void {
    this.itemsService.deleteItem(itemId).subscribe({
      next: () => {
        this.loadData();
        this.successMessage = 'Announcement deleted.';
      },
      error: () => {
        this.errorMessage = 'Unable to delete announcement.';
      }
    });
  }

  private loadData(): void {
    forkJoin({
      pendingItems: this.itemsService.getPendingItems(),
      publishedItems: this.itemsService.getPublishedItems()
    }).subscribe({
      next: (data) => {
        this.applyData(data);
      },
      error: () => {
        this.errorMessage = 'Unable to load moderation data.';
      }
    });
  }

  private applyData(data: ModerationPageData): void {
    this.pendingItems = data.pendingItems;
    this.publishedItems = data.publishedItems;
    this.errorMessage = '';
  }
}
