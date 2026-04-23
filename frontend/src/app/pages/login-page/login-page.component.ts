import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  protected username = '';
  protected password = '';
  protected errorMessage = '';

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected login(): void {
    this.authService.login({ username: this.username, password: this.password }).subscribe((result) => {
      if (!result.success) {
        this.errorMessage = result.message;
        return;
      }

      this.errorMessage = '';
      void this.router.navigate(['/items']);
    });
  }
}
