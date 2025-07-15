import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonLoading,
    IonMenuButton,
    IonRow,
    IonSpinner,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {BookingService} from "./booking.service";
import {Booking} from "./booking.model";
import {addIcons} from "ionicons";
import {trashOutline} from "ionicons/icons";
import {Subscription} from "rxjs";
import {PlacesService} from "../places/places.service";

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.page.html',
    styleUrls: ['./bookings.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonMenuButton, IonList, IonGrid, IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonLabel, IonRow, IonCol, IonIcon, IonLoading, IonSpinner]
})
export class BookingsPage implements OnInit, OnDestroy {

    loadedBookings!: Booking[];
    bookingsSubscription!: Subscription;
    bookingsSubscriptionFetch!: Subscription;
    _loading: boolean = false;
    fetchLoading: boolean = true;

    constructor(private bookingsService: BookingService,
                private placesService: PlacesService) {
        addIcons({trashOutline})
    }

    ngOnDestroy(): void {
        if (this.bookingsSubscription) {
            this.bookingsSubscription.unsubscribe();
        }
        if (this.bookingsSubscriptionFetch) {
            this.bookingsSubscriptionFetch.unsubscribe();
        }
    }

    ngOnInit() {
        console.log('BookingsPage ngOnInit');
        this.bookingsSubscription = this.bookingsService.bookings.subscribe(bookings => {
            this.loadedBookings = bookings;
        });
    }

    ionViewWillEnter() {
        this.fetchLoading = true;
        this.bookingsSubscriptionFetch = this.bookingsService.fetchBookings().subscribe(
            () => this.fetchLoading = false
        );
    }

    get loading() {
        return this._loading;
    }

    async onCancelBooking(bookingId: string, slidingItem: IonItemSliding) {
        this._loading = true;
        await this.bookingsService.cancelBooking(bookingId).then(
            () => {
                this._loading = false;
                slidingItem.close();
            }
        );
    }
}
