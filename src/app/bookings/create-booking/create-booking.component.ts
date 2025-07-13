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
    IonInput,
    IonItem,
    IonLabel,
    IonPopover,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
} from "@ionic/angular/standalone";
import {Place} from "../../places/model/place.model";
import {addIcons} from "ionicons";
import {checkmarkOutline, closeOutline} from "ionicons/icons";
import {FormsModule, NgForm, ReactiveFormsModule} from "@angular/forms";
import {CreateBookingDto} from "../booking.model";

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
        IonInput,
        FormsModule,
        IonRow,
        IonSelect,
        IonSelectOption,
        IonDatetime,
        IonDatetimeButton,
        IonLabel,
        IonPopover,
        ReactiveFormsModule
    ]
})
export class CreateBookingComponent implements OnInit {

    @ViewChild('bookingForm') form!: NgForm;
    bookModalActionMode = input.required<'select' | 'random'>();
    place = input.required<Place>();
    isModalClosed = output<CreateBookingDto>();
    dateFrom!: string;
    dateTo!: string ;

    constructor() {
        addIcons({closeOutline})
        addIcons({checkmarkOutline})
    }


    ngOnInit() {
        console.log('CreateBookingComponent initialized with place:', this.place());
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
                firstName: this.form.value['first-name'],
                lastName: this.form.value['last-name'],
                guestNumber: this.form.value['guest-number'],
                startDate: this.form.value['date-from'],
                endDate: this.form.value['date-to']
            },
            role: 'confirm'
        });

    }
}
