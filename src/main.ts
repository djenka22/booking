import {bootstrapApplication} from '@angular/platform-browser';
import {PreloadAllModules, provideRouter, RouteReuseStrategy, withPreloading} from '@angular/router';
import {IonicRouteStrategy, provideIonicAngular} from '@ionic/angular/standalone';

import {routes} from './app/app.routes';
import {AppComponent} from './app/app.component';
import {initializeApp, provideFirebaseApp} from "@angular/fire/app";
import {firebaseConfig} from "./environments/environment";
import {getFirestore, provideFirestore} from "@angular/fire/firestore";

bootstrapApplication(AppComponent, {
    providers: [
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        provideIonicAngular(),
        provideRouter(routes, withPreloading(PreloadAllModules)),
        provideFirebaseApp(() => initializeApp(firebaseConfig)),
        provideFirestore(() => getFirestore()),
    ],
});
