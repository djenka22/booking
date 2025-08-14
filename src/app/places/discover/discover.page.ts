import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonMenuButton,
    IonRow,
    IonSearchbar,
    IonSpinner,
    IonToolbar
} from '@ionic/angular/standalone';
import {PlacesService} from "../places.service";
import {Place} from "../model/place.model";
import {FeaturedPlacesFilterPipe} from "../pipes/FeaturedPlacesFilterPipe";
import {FeaturedPlaceComponent} from "../shared/featured-place/featured-place.component";
import {CommonPlaceComponent} from "../shared/common-place/common-place.component";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {Subscription, switchMap} from "rxjs";
import {addIcons} from "ionicons";
import {searchCircle} from "ionicons/icons";
import {AuthService} from "../../auth/auth.service";

@Component({
    selector: 'app-discover',
    templateUrl: './discover.page.html',
    styleUrls: ['./discover.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, IonGrid, IonRow, IonCol, FeaturedPlacesFilterPipe, IonButtons, FeaturedPlaceComponent, IonMenuButton, CommonPlaceComponent, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, IonSpinner, IonSearchbar]
})
export class DiscoverPage implements OnInit, OnDestroy {

    @ViewChild('searchbar') ionSearchbar!: IonSearchbar;
    loadedPlaces!: Place[];
    placesSubscription!: Subscription
    placesSubscriptionFetch!: Subscription
    presentedPlaces!: PresentedPlace[];
    fetchLoading: boolean = false;
    hasFeaturedPlaces: boolean = false;
    authenticatedUserId!: string;

    constructor(private placesService: PlacesService,
                private authService: AuthService) {
        addIcons({ searchCircle });
    }

    ngOnDestroy(): void {
        if (this.placesSubscription) {
            this.placesSubscription.unsubscribe();
        }
        if (this.placesSubscriptionFetch) {
            this.placesSubscriptionFetch.unsubscribe();
        }
    }

    ngOnInit() {
        console.log('DiscoverPage ngOnInit');
        this.placesSubscription = this.authService.userId.pipe(
            switchMap(userId => {
                console.log('DiscoverPage ngOnInit - userId:', userId);
                if (!userId) {
                    throw new Error('User not authenticated');
                }
                this.authenticatedUserId = userId;
                return this.placesService.places;
            })
        ).subscribe(
            places => {
                this.loadedPlaces = places;
                this.presentedPlaces = this.setPresentedPlaces(this.loadedPlaces)
                this.hasFeaturedPlaces = this.loadedPlaces.some(place => place.featured);
            }
        );
    }

    ionViewWillEnter() {
        this.ionSearchbar.value = '';
        this.fetchLoading = true;
        this.placesSubscriptionFetch = this.placesService.fetchPlaces().subscribe(
            () => this.fetchLoading = false
        );
    }

    onClearSearch() {
        this.presentedPlaces = this.setPresentedPlaces(this.loadedPlaces);
        this.hasFeaturedPlaces = this.loadedPlaces.some(place => place.featured);
    }

    onSearchChange(event: any) {
        const keywords: string = event.target.value;
        if (!keywords || keywords.trim() === '') {
            this.onClearSearch();
            return;
        }

        this.placesService.searchPlaces(keywords)
            .pipe()
            .subscribe((places: Place[]) => {
                this.presentedPlaces = this.setPresentedPlaces(places);
                this.hasFeaturedPlaces = this.presentedPlaces.some(presentedPlace => presentedPlace.place.featured);
            })
    }

    private setPresentedPlaces(places: Place[]): PresentedPlace[] {
        const presentedPlaces: PresentedPlace[] = [];

        for (let place of places) {
            const presentedPlace = new PresentedPlace();
            presentedPlace.place = place;

            if (this.authenticatedUserId !== place.user.id) {
                presentedPlace.routerLinkPath = ['/', 'places', 'tabs', 'discover', place.id];
            } else {
                presentedPlace.routerLinkPath = ['/', 'places', 'tabs', 'offers', place.id];
            }
            presentedPlaces.push(presentedPlace);
        }
        return presentedPlaces;
    }
}

export class PresentedPlace {
    private _place!: Place;
    private _routerLinkPath!: string[]

    set place(place: Place) {
        this._place = place;
    }
    set routerLinkPath(path: string[]) {
        this._routerLinkPath = path;
    }

    get place(): Place {
        return this._place;
    }

    get routerLinkPath(): string[] {
        return this._routerLinkPath;
    }
}
