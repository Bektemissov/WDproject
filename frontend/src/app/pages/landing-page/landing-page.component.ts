import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Item } from '../../models/item';
import { AuthService } from '../../services/auth.service';
import { ItemsService } from '../../services/items.service';

@Component({
  selector: 'app-landing-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  protected featuredItems: Item[] = [];

  private readonly itemsService = inject(ItemsService);
  protected readonly authService = inject(AuthService);

  constructor() {
    this.itemsService.getPublicItems().subscribe((items) => {
      this.featuredItems = items.slice(0, 3);
    });
  }
}
