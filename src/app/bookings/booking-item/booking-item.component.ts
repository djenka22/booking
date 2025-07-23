import {Component, input, OnInit, ViewChild} from '@angular/core';
import {
    IonButton,
    IonCard,
    IonCol,
    IonDatetime,
    IonDatetimeButton,
    IonGrid,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonPopover,
    IonRow,
    IonSpinner,
    IonText
} from "@ionic/angular/standalone";
import {BookingService} from "../booking.service";
import {Place} from "../../places/model/place.model";
import {Booking} from "../booking.model";
import {map, of, switchMap, take} from "rxjs";
import {AuthService, UserData} from "../../auth/auth.service";
import {DatePipe} from "@angular/common";
import {closeOutline, searchCircle} from "ionicons/icons";
import {addIcons} from "ionicons";

@Component({
    selector: 'app-booking-item',
    templateUrl: './booking-item.component.html',
    styleUrls: ['./booking-item.component.scss'],
    imports: [
        IonItem,
        IonLabel,
        IonText,
        DatePipe,
        IonSpinner,
        IonList,
        IonDatetimeButton,
        IonPopover,
        IonDatetime,
        IonButton,
        IonIcon,
        IonRow,
        IonCol,
        IonGrid,
        IonCard,
    ]
})
export class BookingItemComponent implements OnInit {

    @ViewChild('dateToRef') dateToRef!: IonPopover;
    @ViewChild('dateFromRef') dateFromRef!: IonPopover;

    place = input.required<Place>();
    bookingsWithUser!: BookingWithUser[];
    presentedBookingsWithUser!: BookingWithUser[];
    fetchLoading: boolean = false;

    dateFromFilter: string | null = null;
    dateToFilter: string | null = null;

    dateToDisplay: string = 'none';
    dateFromDisplay: string = 'none';


    constructor(private bookingsService: BookingService,
                private authService: AuthService) {
        addIcons({searchCircle});
        addIcons({closeOutline});
    }

    ngOnInit() {
        this.fetchLoading = true;
        let bookings = new Map<string, Booking>();
        this.bookingsService.findAllBookingsByPlaceIdAfterBookedToDate(this.place().id, new Date())
            .pipe(
                switchMap(fetchedBookings => {
                    for (let booking of fetchedBookings) {
                        bookings.set(booking.user.id, booking);
                    }
                    return this.authService.findUsersByIds(fetchedBookings.map(booking => booking.user.id)).pipe(take(1));
                }),
                map(users => {
                    let bookingsWithUser: BookingWithUser[] = [];
                    users.map(user => {
                        if (bookings.has(user.id)) {
                            bookingsWithUser.push({
                                booking: bookings.get(user.id)!,
                                user: user
                            });
                        }
                    });
                    return bookingsWithUser;
                })
            ).subscribe(
            bookingsWithUser => {
                this.bookingsWithUser = bookingsWithUser;
                this.presentedBookingsWithUser = this.bookingsWithUser;
                this.fetchLoading = false
            }
        );
    }

    onDateFromChange(event: any) {
        this.dateFromFilter = event.detail.value;
    }

    onDateToChange(event: any) {
        this.dateToFilter = event.detail.value;
    }

    applyFilter() {
        let bookings = new Map<string, Booking>();
        const dateFrom = this.dateFromFilter ? new Date(this.dateFromFilter) : null;
        const dateTo = this.dateToFilter ? new Date(this.dateToFilter) : null;

        this.bookingsService.findBookingsByDatesInRange(dateFrom, dateTo)
            .pipe(
                take(1),
                switchMap(fetchedBookings => {
                        if (fetchedBookings.length === 0) {
                            return of([]);
                        }
                        for (let booking of fetchedBookings) {
                            bookings.set(booking.user.id, booking);
                        }
                        return this.authService.findUsersByIds(fetchedBookings.map(booking => booking.user.id)).pipe(take(1));
                    }
                ),
                map(users => {
                    let bookingsWithUser: BookingWithUser[] = [];
                    users.map(user => {
                        if (bookings.has(user.id)) {
                            bookingsWithUser.push({
                                booking: bookings.get(user.id)!,
                                user: user
                            });
                        }
                    });
                    return bookingsWithUser;
                })
            ).subscribe(bookingsWithUser => {
                this.presentedBookingsWithUser = bookingsWithUser;
            }
        );

    }

    onDateToItemClick() {
        this.dateToRef.present();
    }

    cancelDateToFilter() {
        this.dateToDisplay = 'none';
        this.dateToFilter = null;
        this.presentedBookingsWithUser = this.bookingsWithUser;
    }

    onDateFromItemClick() {
        this.dateFromRef.present();
    }

    cancelDateFromFilter() {
        this.dateFromDisplay = 'none';
        this.dateFromFilter = null;
        this.presentedBookingsWithUser = this.bookingsWithUser;
    }

    onDateToPopoverDismiss() {
        this.dateToDisplay = this.dateToFilter ? 'block' : 'none';
    }

    onDateFromPopoverDismiss() {
        this.dateFromDisplay = this.dateFromFilter ? 'block' : 'none';
    }

}

interface BookingWithUser {
    booking: Booking;
    user: UserData;
}
