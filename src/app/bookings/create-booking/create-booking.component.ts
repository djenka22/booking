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
import {CreateBookingDto} from "../booking.model";
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
    bookModalActionMode = input.required<'select' | 'random'>();
    place = input.required<Place>();
    isModalClosed = output<CreateBookingDto>();
    dateFrom!: string;
    dateTo!: string ;
    loggedInUser!: User;
    fetchLoading: boolean = false;

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
            this.dateFrom = this.place().availableFrom.toDate().toISOString();
            this.dateTo = this.dateFrom;
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
                guestNumber: this.form.value['guest-number'],
                startDate: this.form.value['date-from'],
                endDate: this.form.value['date-to']
            },
            role: 'confirm'
        });

    }
}
