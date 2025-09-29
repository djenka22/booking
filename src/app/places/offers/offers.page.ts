import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItemSliding,
    IonList,
    IonMenuButton,
    IonRow,
    IonSearchbar,
    IonSpinner,
    IonToolbar
} from '@ionic/angular/standalone';
import {OfferItemComponent} from "./offer-item/offer-item.component";
import {PlacesService} from "../places.service";
import {Place} from "../model/place.model";
import {addIcons} from "ionicons";
import {addOutline, informationCircleOutline, searchCircle} from "ionicons/icons";
import {RouterLink} from "@angular/router";
import {Subscription, switchMap, take} from "rxjs";
import {AuthService} from "../../auth/auth.service";

@Component({
    selector: 'app-offers',
    templateUrl: './offers.page.html',
    styleUrls: ['./offers.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, IonCol, IonGrid, IonList, IonRow, OfferItemComponent, IonButtons, IonButton, IonIcon, RouterLink, IonMenuButton, IonSpinner, IonSearchbar]
})
export class OffersPage implements OnInit, OnDestroy {
    @ViewChild('searchbar') ionSearchbar!: IonSearchbar;

    loading: boolean = false;
    loadedOffers!: Place[];
    presentedOffers!: Place[];
    private placesSubscription!: Subscription;
    ionItemSliding?: IonItemSliding;

    constructor(private placesService: PlacesService,
                private authService: AuthService) {
        addIcons({addOutline});
        addIcons({ searchCircle });
        addIcons({ informationCircleOutline });
    }

    ngOnDestroy(): void {
        if (this.placesSubscription) {
            this.placesSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        console.log('OffersPage ngOnInit');
        this.loading = true;


        this.placesSubscription = this.authService.userId.pipe(
            take(1),
            switchMap(userId => {
                if (!userId) {
                    this.loading = false;
                    throw new Error('User not authenticated');
                }
                return this.placesService.getOffersByUserId(userId);
            })
        ).subscribe(
            places => {
                this.loadedOffers = places;
                this.presentedOffers = this.loadedOffers;
                this.loading = false;
            }
        );
    }

    ionViewWillEnter() {
        this.ionSearchbar.value = '';

        if (this.ionItemSliding) {
            this.ionItemSliding.closeOpened();
        }
    }

    onSlidingItemOutput(ionItemSliding: IonItemSliding) {
        this.ionItemSliding = ionItemSliding;
    }

    onClearSearch() {
        this.presentedOffers = this.loadedOffers;
    }

    onSearchChange(event: any) {
        const keywords: string = event.target.value;
        if (!keywords || keywords.trim() === '') {
            this.onClearSearch();
            return;
        }

        this.placesService.searchOffers(keywords)
            .pipe()
            .subscribe((offers: Place[]) => {
                this.presentedOffers = offers;
            })
    }

}
