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
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {BookingService} from "./booking.service";
import {Booking} from "./booking.model";
import {addIcons} from "ionicons";
import {trashOutline} from "ionicons/icons";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.page.html',
    styleUrls: ['./bookings.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonMenuButton, IonList, IonGrid, IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonLabel, IonRow, IonCol, IonIcon, IonLoading]
})
export class BookingsPage implements OnInit, OnDestroy {

    loadedBookings!: Booking[];
    bookingsSubscription!: Subscription;
    _loading: boolean = false;

    constructor(private bookingsService: BookingService) {
        addIcons({trashOutline})
    }

    ngOnDestroy(): void {
        if (this.bookingsSubscription) {
            this.bookingsSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.bookingsSubscription = this.bookingsService.bookings.subscribe(bookings => {
            this.loadedBookings = bookings;
        });
    }

    get loading() {
        return this._loading;
    }

    onCancelBooking(bookingId: string, slidingItem: IonItemSliding) {
        this._loading = true;
        this.bookingsService.cancelBooking(bookingId).subscribe(() => {
            console.log(this.loading);
            this._loading = false;
            console.log(this.loading);
            slidingItem.close();
        });
    }
}
