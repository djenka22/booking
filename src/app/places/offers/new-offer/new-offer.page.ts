import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {
    IonBackButton,
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
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {addIcons} from "ionicons";
import {calendarOutline, checkmarkOutline} from "ionicons/icons";

@Component({
    selector: 'app-new-offer',
    templateUrl: './new-offer.page.html',
    styleUrls: ['./new-offer.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonGrid, IonRow, IonCol, IonInput, IonItem, IonLabel, IonTextarea, IonDatetime, IonButton, IonIcon, IonDatetimeButton, IonPopover, ReactiveFormsModule, IonText]
})
export class NewOfferPage implements OnInit {
    offerForm!: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        addIcons({checkmarkOutline})
        addIcons({calendarOutline})

        this.offerForm = this.formBuilder.group({
            title: [null, {
                updateOn: 'change',
                validators: [Validators.required]
            }],
            description: [null, {
                updateOn: 'change',
                validators: [Validators.required, Validators.maxLength(180)]
            }],
            price: [null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.min(1)]
            }],
            availableFrom: [null, {
                updateOn: 'blur',
                validators: [Validators.required]
            }],
            availableTo: [null, {
                updateOn: 'blur',
                validators: [Validators.required]
            }]
        })
    }

    ngOnInit() {
    }

    get description() {
        return this.offerForm.get('description');
    }


    onCreateOffer() {
        console.log(this.offerForm);
    }
}
