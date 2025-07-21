import {CanMatchFn, Router} from '@angular/router';
import {AuthService} from "./auth.service";
import {inject} from '@angular/core';
import {of, switchMap, take, tap} from "rxjs";

export const authGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated.pipe(
      take(1),
      switchMap(isAuth => {
          if (!isAuth) {
              console.log('User is not authenticated, attempting auto-login');
              return authService.autoLogin()
          } else {
              return of(isAuth);
          }
      }),
      tap(isAuth => {
            if (!isAuth) {
                router.navigateByUrl('/auth');
            }
      })
  )
};
