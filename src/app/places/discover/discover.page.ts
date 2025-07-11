import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonList,
    IonMenuButton,
    IonRow,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {PlacesService} from "../places.service";
import {Place} from "../place.model";
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
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonGrid, IonRow, IonCol, IonList, FeaturedPlacesFilterPipe, IonButtons, FeaturedPlaceComponent, IonMenuButton, CommonPlaceComponent, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, IonSegment, IonSegmentButton]
})
export class DiscoverPage implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('ionSegment') ionSegment!: IonSegment;
    loadedPlaces!: Place[];
    placesSubscription!: Subscription
    presentedPlaces!: Place[];

    constructor(private placesService: PlacesService,
                private authService: AuthService) {
    }

    ngOnDestroy(): void {
        if (this.placesSubscription) {
            this.placesSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.placesSubscription = this.placesService.places.subscribe(
            places => {
                this.loadedPlaces = places;
            }
        );
    }

    ngAfterViewInit() {
        this.setFilteredPlaces(this.ionSegment.value);
    }

    onFilterUpdate($event: CustomEvent<SegmentChangeEventDetail>) {
        if ($event.detail.value === 'all') {
            this.presentedPlaces = this.loadedPlaces;
        } else {
            this.presentedPlaces = this.loadedPlaces.filter(place => {
                return place.userId !== this.authService.userId;
            });
        }
    }

    setFilteredPlaces(filterValue: SegmentValue | undefined) {
        if (filterValue && filterValue === 'all') {
            this.presentedPlaces = this.loadedPlaces;
        } else {
            this.presentedPlaces = this.loadedPlaces.filter(place => {
                return place.userId !== this.authService.userId;
            });
        }
    }
}
