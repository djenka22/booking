import {CanMatchFn, Router} from '@angular/router';
import {AuthService} from "./auth.service";
import {inject} from '@angular/core';
import {take, tap} from "rxjs";

export const authGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated.pipe(
      take(1),
      tap(isAuth => {
            if (!isAuth) {
                router.navigateByUrl('/auth');
            }
      })
  )
};
