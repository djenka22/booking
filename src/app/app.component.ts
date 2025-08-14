import {Component, OnDestroy, OnInit} from '@angular/core';
import {
    IonApp,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonRouterOutlet,
    IonTitle,
    IonToolbar,
    NavController,
    Platform
} from '@ionic/angular/standalone';
import {addIcons} from "ionicons";
import {businessOutline, checkboxOutline, exitOutline, statsChartOutline} from "ionicons/icons";
import {RouterLink} from "@angular/router";
import {AuthService} from "./auth/auth.service";
import {Capacitor} from "@capacitor/core";
import {SplashScreen} from "@capacitor/splash-screen";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, RouterLink, IonMenuToggle],
})
export class AppComponent implements OnInit, OnDestroy {

    authSubscription!: Subscription;

    constructor(private authService: AuthService,
                private navController: NavController,
                private platform: Platform) {
        addIcons({businessOutline})
        addIcons({checkboxOutline})
        addIcons({exitOutline})
        addIcons({statsChartOutline})
        this.initializeApp();
    }

    ngOnDestroy(): void {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }

    ngOnInit(): void {
       console.log('AppComponent ngOnInit');
        this.authSubscription = this.authService.isAuthenticated.subscribe(
            isAuth => {
                if (!isAuth) {
                    this.navController.navigateRoot('/auth');
                }
            });
    }

    initializeApp() {
        this.platform.ready().then(() => {
            if (Capacitor.isPluginAvailable('SplashScreen')) {
                SplashScreen.hide();
            }
        });
    }

    onLogout() {
        this.authService.logout();
        this.navController.navigateBack('/auth');
    }
}
