import {Component, input, OnInit, output} from '@angular/core';
import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar} from "@ionic/angular/standalone";
import {Place} from "../../places/place.model";
import {addIcons} from "ionicons";
import {checkmarkOutline, closeOutline} from "ionicons/icons";

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
        IonIcon
    ]
})
export class CreateBookingComponent implements OnInit {
    place = input.required<Place>();
    isClosed = output<string>()

    constructor() {
        addIcons({closeOutline})
        addIcons({checkmarkOutline})
    }

    ngOnInit() {
    }

    onCancel() {
        this.isClosed.emit('cancel');
    }

    onBookPlace() {
        this.isClosed.emit('confirm');
    }
}
