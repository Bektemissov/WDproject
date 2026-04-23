import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategoryOption } from '../../models/category';
import { LocationOption } from '../../models/location';
import { ItemsService, ItemPayload } from '../../services/items.service';

@Component({
  selector: 'app-create-announcement-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './create-announcement-page.component.html',
  styleUrl: './create-announcement-page.component.css'
})
export class CreateAnnouncementPageComponent {
  protected categories: CategoryOption[] = [];
  protected locations: LocationOption[] = [];
  protected form: ItemPayload = {
    title: '',
    description: '',
    type: 'lost',
    category_id: null,
    location_id: null
  };
  protected errorMessage = '';
  protected successMessage = '';

  private readonly itemsService = inject(ItemsService);
  private readonly router = inject(Router);

  constructor() {
    this.itemsService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
    this.itemsService.getLocations().subscribe((locations) => {
      this.locations = locations;
    });
  }

  protected submit(): void {
    this.itemsService.createItem(this.form).subscribe({
      next: () => {
        this.errorMessage = '';
        this.successMessage = 'Announcement submitted for moderation.';
        setTimeout(() => {
          void this.router.navigate(['/profile']);
        }, 700);
      },
      error: () => {
        this.errorMessage = 'Unable to submit the announcement. Please check the form fields.';
        this.successMessage = '';
      }
    });
  }
}
