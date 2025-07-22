import {Component, input, OnInit, output, ViewChild} from '@angular/core';
import {
    AlertController,
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
import {map, switchMap, take} from "rxjs";
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
    @ViewChild('bookToIonDatetime') bookToIonDatetime!: IonDatetime;
    @ViewChild('bookFromIonDatetime') bookFromIonDatetime!: IonDatetime;

    bookModalActionMode = input<'select' | 'random'>();
    place = input.required<Place>();
    existingBooking = input.required<Booking>();
    isModalClosed = output<CreateBookingDto>();
    dateFrom!: string;
    dateFromMinConstraint!: string;
    dateTo!: string;
    loggedInUser!: User;
    fetchLoading: boolean = false;
    guestNumber: string = '2';
    disabledDatesSet: Set<string> = new Set();
    firstAvailableDate!: Date;

    constructor(private authService: AuthService,
                private bookingService: BookingService,
                private alertController: AlertController) {
        addIcons({closeOutline})
        addIcons({checkmarkOutline})
    }


    ngOnInit() {
        console.log('CreateBookingComponent ngOnInit');

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
            }),
            take(1)
        ).subscribe(
            dates => {
                this.disabledDatesSet = new Set(dates);

                if (this.existingBooking()) {
                    this.setDataForExistingBooking();
                    this.dateFromMinConstraint = new Date().toISOString();
                    this.fetchLoading = false;
                    return;
                }

                const firstAvailableDate = this.findFirstAvailableDate(this.place().availableFrom.toDate(), this.place().availableTo.toDate(), this.disabledDatesSet);
                if (!firstAvailableDate) {
                    this.presentAlertForNoAvailableDates();
                    return;
                }

                this.firstAvailableDate = firstAvailableDate;
                this.dateFromMinConstraint = this.firstAvailableDate.toISOString();
                this.dateFrom = this.firstAvailableDate.toISOString();
                this.dateTo = this.firstAvailableDate.toISOString();
                this.fetchLoading = false;


            },
        );
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

        const isValid = this.validateDateRange();

        if (!isValid) {
            this.bookToIonDatetime.cancel(true);
            this.alertController.create({
                header: 'Invalid Date Range',
                subHeader: 'Please select a different date range',
                message: 'The selected date range already has bookings in between',
                buttons: [
                    {
                        text: 'Okay',
                        role: 'destructive',
                        handler: () => {
                            if (this.existingBooking()) {
                                this.dateFrom = this.existingBooking().bookedFrom.toDate().toISOString();
                                this.dateTo = this.existingBooking().bookedTo.toDate().toISOString();
                            } else {
                                this.dateFrom = this.firstAvailableDate.toISOString();
                                this.dateTo = this.firstAvailableDate.toISOString();
                            }
                        }
                    }
                ]
            }).then(alert => alert.present());
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
        let currentDate = startDate.toDate();
        const end = endDate.toDate();


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

    private findFirstAvailableDate(
        placeAvailableFrom: Date,
        placeAvailableTo: Date,
        disabledDates: Set<string>
    ): Date | null {
        let searchStartDate = new Date();

        if (searchStartDate < placeAvailableFrom) {
            searchStartDate = new Date(placeAvailableFrom);
        }

        let currentDate = new Date(searchStartDate);

        while (currentDate <= placeAvailableTo) {
            const formattedDate = this.formatDateToYYYYMMDD(currentDate);
            if (!disabledDates.has(formattedDate)) {
                return currentDate;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return null;
    }

    private validateDateRange() {
        const beginningDate = new Date(this.dateFrom);
        const endDate = new Date(this.dateTo);

        let isValid = true;

        const selectedDates = this.getDatesInRange(Timestamp.fromDate(beginningDate), Timestamp.fromDate(endDate));
        for (const selectedDate of selectedDates) {
            if (this.disabledDatesSet.has(selectedDate)) {
                isValid = false;
                break;
            }
        }
        return isValid;
    }

    private setDataForExistingBooking() {
        this.dateFrom = this.existingBooking().bookedFrom.toDate().toISOString();
        this.dateTo = this.existingBooking().bookedTo.toDate().toISOString();
        this.guestNumber = this.existingBooking().guestNumber.toString();
    }

    presentAlertForNoAvailableDates() {
        this.alertController.create({
            header: `No available dates at ${this.place().title}`,
            message: 'There are no available dates for this place.',
            buttons: [
                {
                    text: 'Okay',
                    role: 'destructive',
                    handler: () => {
                        this.fetchLoading = false;
                        this.isModalClosed.emit({
                            role: 'cancel'
                        });
                    }
                }
            ]
        }).then(alert => alert.present());
    }
}
