import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Item } from '../../models/item';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-items-page',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './items-page.component.html',
  styleUrl: './items-page.component.css'
})
export class ItemsPageComponent {
  protected items: Item[] = [];
  protected filteredItems: Item[] = [];
  protected selectedType = 'all';
  protected selectedStatus = 'all';
  protected isLoading = true;

  private readonly route = inject(ActivatedRoute);
  protected readonly authService = inject(AuthService);

  constructor() {
    this.route.data.subscribe((data) => {
      this.items = (data['items'] as Item[]) ?? [];
      this.applyFilters();
      this.isLoading = false;
    });
  }

  protected applyFilters(): void {
    this.filteredItems = this.items.filter((item) => {
      const matchesType = this.selectedType === 'all' || item.type === this.selectedType;
      const matchesStatus = this.selectedStatus === 'all' || item.status === this.selectedStatus;
      return matchesType && matchesStatus;
    });
  }
}
