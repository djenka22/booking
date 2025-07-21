import {Component, input, OnInit, output, ViewChild} from '@angular/core';
import {
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonDatetime,
    IonDatetimeButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonPopover,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar
} from "@ionic/angular/standalone";
import {Place} from "../../places/model/place.model";
import {addIcons} from "ionicons";
import {checkmarkOutline, closeOutline} from "ionicons/icons";
import {FormsModule, NgForm, ReactiveFormsModule} from "@angular/forms";
import {Booking, CreateBookingDto} from "../booking.model";
import {User} from "../../auth/user.model";
import {AuthService} from "../../auth/auth.service";
import {BookingService} from "../booking.service";
import {map, switchMap} from "rxjs";
import {Timestamp} from "firebase/firestore";

@Component({
    selector: 'app-create-booking',
    templateUrl: './create-booking.component.html',
    styleUrls: ['./create-booking.component.scss'],
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonButtons,
        IonButton,
        IonIcon,
        IonGrid,
        IonCol,
        IonItem,
        FormsModule,
        IonRow,
        IonSelect,
        IonSelectOption,
        IonDatetime,
        IonDatetimeButton,
        IonLabel,
        IonPopover,
        ReactiveFormsModule,
        IonSpinner
    ]
})
export class CreateBookingComponent implements OnInit {

    @ViewChild('bookingForm') form!: NgForm;
    bookModalActionMode = input<'select' | 'random'>();
    place = input.required<Place>();
    existingBooking = input.required<Booking>();
    isModalClosed = output<CreateBookingDto>();
    dateFrom!: string;
    dateTo!: string;
    loggedInUser!: User;
    fetchLoading: boolean = false;
    guestNumber: string = '2';
    disabledDatesSet: Set<string> = new Set();

    constructor(private authService: AuthService,
                private bookingService: BookingService) {
        addIcons({closeOutline})
        addIcons({checkmarkOutline})
    }


    ngOnInit() {
        this.fetchLoading = true;
        this.authService.user.pipe(
            map(user => {
                if (!user) {
                    throw new Error('User not found');
                }
                this.loggedInUser = user;
                return user;
            }),
            switchMap(user => {
                if (this.existingBooking()) {
                    return this.bookingService.findAllBookingsByPlaceIdExcludeBookingId(this.place().id, this.existingBooking().id);
                }
                return this.bookingService.findAllBookingsByPlaceId(this.place().id);

            }),
            map(bookings => {
                const allBookedDates: string[] = [];
                bookings.forEach(booking => {
                    const datesInBooking = this.getDatesInRange(booking.bookedFrom, booking.bookedTo);
                    allBookedDates.push(...datesInBooking);
                })
                return allBookedDates;
            })
        ).subscribe(
            dates => {
                this.disabledDatesSet = new Set(dates);
                this.fetchLoading = false;
            },
        );
        console.log('CreateBookingComponent ngOnInit');

        const availableFrom = this.place().availableFrom.toDate();
        const availableTo = this.place().availableTo.toDate();


        if (this.bookModalActionMode()) {
            if (this.bookModalActionMode() === 'random') {
                this.dateFrom = new Date(
                    availableFrom.getTime() +
                    Math.random() *
                    (availableTo.getTime() - 7 * 24 * 60 * 60 * 1000 - availableFrom.getTime())
                ).toISOString();

                this.dateTo = new Date(
                    new Date(this.dateFrom).getTime()
                    + Math.random() *
                    (new Date(this.dateFrom).getTime() + 6 * 24 * 60 * 60 * 1000 - new Date(this.dateFrom).getTime())
                ).toISOString();

            } else {
                this.dateFrom = this.place().availableFrom.toDate().toISOString(); // update set dateFrom to currentDate OR availableFrom!!!!!!!
                this.dateTo = this.dateFrom;
            }
        }

        if (this.existingBooking()) {
            this.dateFrom = this.existingBooking().bookedFrom.toDate().toISOString();
            this.dateTo = this.existingBooking().bookedTo.toDate().toISOString();
            this.guestNumber = this.existingBooking().guestNumber.toString();
        }

    }

    onCancel() {
        this.isModalClosed.emit({
                role: 'cancel'
            }
        );
    }

    onDateFromChange() {
        const newDateFromObj = new Date(this.dateFrom);
        const currentToDateObj = new Date(this.dateTo);

        if (newDateFromObj > currentToDateObj) {
            this.dateTo = this.dateFrom;
        }
    }

    onBookPlace() {
        if (this.form.invalid) {
            return;
        }

        this.isModalClosed.emit({
            bookingData: {
                existingBookingId: this.existingBooking() ? this.existingBooking().id : undefined,
                guestNumber: this.form.value['guest-number'],
                startDate: new Date(this.form.value['date-from']),
                endDate: new Date(this.form.value['date-to'])
            },
            role: this.existingBooking() ? 'update' : 'confirm'
        });

    }

    isDateEnabled = (isoString: string) => {
        const date = new Date(isoString);
        const formattedDate = this.formatDateToYYYYMMDD(date);
        return !this.disabledDatesSet.has(formattedDate);
    };

    private getDatesInRange(startDate: Timestamp, endDate: Timestamp): string[] {
        const dates: string[] = [];
        let currentDate = startDate.toDate(); // Convert Firebase Timestamp to JS Date
        const end = endDate.toDate(); // Convert Firebase Timestamp to JS Date


        while (currentDate <= end) {
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
            const day = currentDate.getDate().toString().padStart(2, '0');
            dates.push(`${year}-${month}-${day}`);
            currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
        }
        return dates;
    }

    private formatDateToYYYYMMDD(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
