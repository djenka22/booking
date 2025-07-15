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
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {PlacesService} from "../places.service";
import {Place} from "../model/place.model";
import {FeaturedPlacesFilterPipe} from "../pipes/FeaturedPlacesFilterPipe";
import {FeaturedPlaceComponent} from "../shared/featured-place/featured-place.component";
import {CommonPlaceComponent} from "../shared/common-place/common-place.component";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {SegmentChangeEventDetail, SegmentValue} from "@ionic/angular";
import {Subscription} from "rxjs";
import {AuthService} from "../../auth/auth.service";

@Component({
    selector: 'app-discover',
    templateUrl: './discover.page.html',
    styleUrls: ['./discover.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonGrid, IonRow, IonCol, FeaturedPlacesFilterPipe, IonButtons, FeaturedPlaceComponent, IonMenuButton, CommonPlaceComponent, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, IonSegment, IonSegmentButton, IonSpinner]
})
export class DiscoverPage implements OnInit, OnDestroy {

    @ViewChild('ionSegment') ionSegment!: IonSegment;
    loadedPlaces!: Place[];
    placesSubscription!: Subscription
    placesSubscriptionFetch!: Subscription
    presentedPlaces!: Place[];
    fetchLoading: boolean = false;
    activeFilter = 'bookable';

    constructor(private placesService: PlacesService,
                private authService: AuthService) {
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
        this.fetchLoading = true;
        this.placesSubscription = this.placesService.places.subscribe(
            places => {
                this.loadedPlaces = places;
                this.setFilteredPlaces(this.activeFilter);
                this.fetchLoading = false;
            }
        );
    }

    ionViewWillEnter() {
        console.log('DiscoverPage ionViewWillEnter');
        this.placesSubscriptionFetch = this.placesService.fetchPlaces().subscribe();
    }

    onFilterUpdate($event: CustomEvent<SegmentChangeEventDetail>) {
        this.setFilteredPlaces($event.detail.value);
    }

    setFilteredPlaces(filterValue: SegmentValue | undefined) {
        this.activeFilter = filterValue as string;
        if (this.activeFilter === 'all') {
            this.presentedPlaces = this.loadedPlaces;
        } else {
            this.presentedPlaces = this.loadedPlaces.filter(place => {
                return place.userId !== this.authService.userId;
            });
        }
    }
}
