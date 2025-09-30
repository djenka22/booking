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
import {Capacitor} from "@capacitor/core";
import {getAuth, indexedDBLocalPersistence, initializeAuth, provideAuth} from "@angular/fire/auth";

const app = initializeApp(firebaseConfig);

bootstrapApplication(AppComponent, {
    providers: [
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        provideIonicAngular(),
        provideRouter(routes, withPreloading(PreloadAllModules)),
        provideFirebaseApp(() => app),
        provideFirestore(() => getFirestore()),
        provideStorage(() => getStorage()),
        provideHttpClient(),
        provideAuth(() => {
                if (Capacitor.isNativePlatform()) {
                    return initializeAuth(getApp(), {
                        persistence: indexedDBLocalPersistence
                    })
                } else {
                    return getAuth();
                }
            }
        )
    ],
});
