import {Routes} from '@angular/router';
import {authGuard} from "./auth/auth.guard";

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'places',
        pathMatch: 'full',
    },
    {
        path: 'auth',
        loadComponent: () => import('./auth/auth.page').then(m => m.AuthPage)
    },
    {
        path: 'places',
        loadChildren: () => import('./places/places.routes').then((m) =>m.routes),
        canMatch: [authGuard]
    },
    {
        path: 'bookings',
        loadComponent: () => import('./bookings/bookings.page').then(m => m.BookingsPage),
        canMatch: [authGuard]
    },
];
