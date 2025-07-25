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
import {Booking, BookingFormDto} from "../booking.model";
import {User} from "../../auth/user.model";
import {AuthService} from "../../auth/auth.service";
import {BookingService} from "../booking.service";
import {map, switchMap, take} from "rxjs";
import {DateUtilsService} from "../../shared/utils/date-utils.service";

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
    isModalClosed = output<BookingFormDto>();
    dateFrom!: string;
    dateFromMinConstraint!: string;
    dateTo!: string;
    loggedInUser!: User;
    fetchLoading: boolean = false;
    guestNumber: string = '2';
    disabledDatesSet: Set<string> = new Set();
    firstAvailableDate!: Date;
    guestNumberIterator: string[] = [];

    constructor(private authService: AuthService,
                private bookingService: BookingService,
                private alertController: AlertController) {
        addIcons({closeOutline})
        addIcons({checkmarkOutline})
    }


    ngOnInit() {
        console.log('CreateBookingComponent ngOnInit');
        this.guestNumberIterator = Array.from({length: this.place().guestNumber}, (_, i) => (i + 1).toString());

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
                    allBookedDates.push(...booking.datesInRange);
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

                const firstAvailableDate = DateUtilsService.findFirstAvailableDate(this.place().availableFrom.toDate(), this.place().availableTo.toDate(), this.disabledDatesSet);
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
        const formattedDate = DateUtilsService.formatDateToYYYYMMDD(date);
        return !this.disabledDatesSet.has(formattedDate);
    };

    private validateDateRange() {
        const beginningDate = new Date(this.dateFrom);
        const endDate = new Date(this.dateTo);

        let isValid = true;

        const selectedDates = DateUtilsService.getDatesInRange(beginningDate, endDate);
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
