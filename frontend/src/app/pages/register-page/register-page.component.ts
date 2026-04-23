import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterPayload } from '../../services/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  protected form: RegisterPayload = {
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    patronymic: '',
    phone_number: '',
    course: '1'
  };
  protected errorMessage = '';
  protected successMessage = '';

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected register(): void {
    this.authService.register(this.form).subscribe((result) => {
      if (!result.success) {
        this.errorMessage = result.message;
        this.successMessage = '';
        return;
      }

      this.errorMessage = '';
      this.successMessage = 'Registration completed. You can now sign in.';
      setTimeout(() => {
        void this.router.navigate(['/login']);
      }, 800);
    });
  }
}
