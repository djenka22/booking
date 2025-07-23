import {bootstrapApplication} from '@angular/platform-browser';
import {PreloadAllModules, provideRouter, RouteReuseStrategy, withPreloading} from '@angular/router';
import {IonicRouteStrategy, provideIonicAngular} from '@ionic/angular/standalone';

import {routes} from './app/app.routes';
import {AppComponent} from './app/app.component';
import {getApp, initializeApp, provideFirebaseApp} from "@angular/fire/app";
import {firebaseConfig} from "./environments/environment.prod";
import {getFirestore, provideFirestore} from "@angular/fire/firestore";
import {getStorage, provideStorage} from "@angular/fire/storage";
import {provideHttpClient} from "@angular/common/http";
import {getAuth, initializeAuth, provideAuth} from "@angular/fire/auth";
import {Capacitor} from "@capacitor/core";

bootstrapApplication(AppComponent, {
    providers: [
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        provideIonicAngular(),
        provideRouter(routes, withPreloading(PreloadAllModules)),
        provideFirebaseApp(() => initializeApp(firebaseConfig)),
        provideFirestore(() => getFirestore()),
        provideStorage(() => getStorage()),
        provideHttpClient(),
        provideAuth(() => {
                if (Capacitor.isNativePlatform()) {
                    return initializeAuth(getApp())
                } else {
                    return getAuth();
                }
            }
        )
    ],
});
