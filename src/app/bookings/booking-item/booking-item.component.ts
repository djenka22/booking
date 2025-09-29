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
    IonText,
    IonTitle
} from "@ionic/angular/standalone";
import {BookingService} from "../booking.service";
import {Place} from "../../places/model/place.model";
import {Booking} from "../booking.model";
import {map, of, switchMap, take} from "rxjs";
import {AuthService} from "../../auth/auth.service";
import {DatePipe} from "@angular/common";
import {closeOutline, searchCircle} from "ionicons/icons";
import {addIcons} from "ionicons";
import {FormsModule} from "@angular/forms";
import {User} from "../../auth/user.model";

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
        IonCard,
        IonTitle,
        FormsModule,
        IonGrid,
        IonRow,
        IonCol,
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

    currentDate: Date = new Date();

    isEmptySearchResult: boolean = false;
    minDateTo: string | null = null;

    constructor(private bookingsService: BookingService,
                private authService: AuthService) {
        addIcons({searchCircle});
        addIcons({closeOutline});
    }

    ngOnInit() {
        this.fetchLoading = true;
        let bookings = new Map<string, Booking>();
        this.bookingsService.findAllBookingsByPlaceIdAfterBookingDate(this.place().id, new Date())
            .pipe(
                take(1),
                switchMap(fetchedBookings => {
                    for (let booking of fetchedBookings) {
                        bookings.set(booking.user.id, booking);
                    }
                    const userIds = fetchedBookings.map(booking => booking.user.id);
                    return this.authService.findUsersByIds(userIds);
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
                }),
                map(bookingsWithUser => {
                    return bookingsWithUser.sort((a, b) => a.booking.bookedFrom.toMillis() - b.booking.bookedFrom.toMillis())
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
        this.minDateTo = this.dateFromFilter;

        if (!this.dateToFilter || this.dateFromFilter && this.dateToFilter && (new Date(this.dateFromFilter) > new Date(this.dateToFilter))) {
            this.dateToFilter = this.dateFromFilter;
        }
    }

    onDateToChange(event: any) {
        this.dateToFilter = event.detail.value;
    }

    applyFilter() {
        let bookings = new Map<string, Booking>();
        const dateFrom = this.dateFromFilter && this.dateFromDisplay === 'block' ? new Date(this.dateFromFilter) : null;
        const dateTo = this.dateToFilter && this.dateToDisplay === 'block' ? new Date(this.dateToFilter) : null;

        this.bookingsService.findBookingsByDatesInRange(dateFrom, dateTo, this.place().id)
            .pipe(
                take(1),
                switchMap(fetchedBookings => {
                    console.log('Fetched bookings:', fetchedBookings);
                        if (fetchedBookings.length === 0) {
                            return of([]);
                        }
                        for (let booking of fetchedBookings) {
                            bookings.set(booking.user.id, booking);
                        }
                        return this.authService.findUsersByIds(fetchedBookings.map(booking => booking.user.id));
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
                }),
                map(bookingsWithUser => {
                    return bookingsWithUser.sort((a, b) => a.booking.bookedFrom.toMillis() - b.booking.bookedFrom.toMillis())
                })
            ).subscribe(bookingsWithUser => {
                this.presentedBookingsWithUser = bookingsWithUser;
                this.isEmptySearchResult = this.presentedBookingsWithUser.length === 0;
            }
        );

    }

    onDateToItemClick() {
        this.dateToRef.present();
    }

    cancelDateToFilter() {
        this.dateToDisplay = 'none';
        this.dateToFilter = null;
        if (this.dateFromDisplay === 'none') {
            this.presentedBookingsWithUser = this.bookingsWithUser;
            this.isEmptySearchResult = this.presentedBookingsWithUser.length === 0;
        }
    }

    onDateFromItemClick() {
        this.dateFromRef.present();
    }

    cancelDateFromFilter() {
        this.dateFromDisplay = 'none';
        this.dateFromFilter = null;
        if (this.dateToDisplay === 'none') {
            this.presentedBookingsWithUser = this.bookingsWithUser;
            this.isEmptySearchResult = this.presentedBookingsWithUser.length === 0;
        }

    }

    onDateToPopoverDismiss() {
        this.dateToDisplay = this.dateToFilter ? 'block' : 'none';
    }

    onDateFromPopoverDismiss() {
        this.dateFromDisplay = this.dateFromFilter ? 'block' : 'none';
    }

}

export interface BookingWithUser {
    booking: Booking;
    user: User;
}
