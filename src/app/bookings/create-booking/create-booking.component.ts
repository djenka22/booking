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
    dateTo!: string ;
    loggedInUser!: User;
    fetchLoading: boolean = false;
    guestNumber: string = '2'

    constructor(private authService: AuthService) {
        addIcons({closeOutline})
        addIcons({checkmarkOutline})
    }


    ngOnInit() {
        this.fetchLoading = true;
        this.authService.getLoggedInUser().subscribe(user => {
                this.loggedInUser = user;
                this.fetchLoading = false;
        });
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
            console.log('Existing booking found', this.existingBooking());
            console.log('Booked from:', this.existingBooking().bookedFrom.toDate());
            this.dateFrom = this.existingBooking().bookedFrom.toDate().toISOString();
            this.dateTo = this.existingBooking().bookedTo.toDate().toISOString();
            this.guestNumber = this.existingBooking().guestNumber.toString();
            console.log('Date From:', this.dateFrom);
            console.log('Existing booking date from', this.existingBooking().bookedFrom.toDate().toISOString());
        }

    }

    onCancel() {
        console.log('Cancel');
        this.isModalClosed.emit({
            role: 'cancel'}
        );
    }

    onDateFromChange() {
        const newDateFromObj = new Date(this.dateFrom);
        const currentToDateObj = new Date(this.dateTo);
        console.log('Form value:', this.form.value['date-from']);


        if (newDateFromObj > currentToDateObj) {
            this.dateTo = this.dateFrom;
        }
    }

    onBookPlace() {
        if (this.form.invalid) {
            return;
        }

        console.log('Book Place', this.existingBooking());
        console.log('Form Value:', this.form.value);
        console.log('Form value date from:', this.form.value['date-from']);

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
}
