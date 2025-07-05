import {CanMatchFn, Router} from '@angular/router';
import {AuthService} from "./auth.service";
import {inject} from '@angular/core';

export const authGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const authenticated = authService.isAuthenticated;

  if (!authenticated) {
    router.navigateByUrl('/auth');
  }

  return authenticated;
};
