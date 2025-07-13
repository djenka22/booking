import {Component, input, OnInit, output} from '@angular/core';
import {
    IonCol,
    IonDatetime,
    IonDatetimeButton,
    IonGrid,
    IonInput,
    IonItem,
    IonLabel,
    IonPopover,
    IonRow,
    IonText,
    IonTextarea
} from "@ionic/angular/standalone";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Place} from "../../model/place.model";

@Component({
    selector: 'app-offer-form',
    templateUrl: './offer-form.component.html',
    styleUrls: ['./offer-form.component.scss'],
    imports: [
        IonRow,
        IonInput,
        IonItem,
        IonCol,
        IonGrid,
        IonTextarea,
        IonLabel,
        IonDatetimeButton,
        IonPopover,
        IonDatetime,
        IonText,
        ReactiveFormsModule
    ]
})
export class OfferFormComponent implements OnInit {

    offerForm!: FormGroup;
    offer = input<Place>();
    formReady = output<FormGroup>();

    constructor(private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        console.log('OfferFormComponent initialized with offer:', this.offer());
        this.offerForm = this.formBuilder.group({
            title: [this.offer()?.title, {
                updateOn: 'change',
                validators: [Validators.required]
            }],
            description: [this.offer()?.description, {
                updateOn: 'change',
                validators: [Validators.required, Validators.maxLength(180)]
            }],
            price: [this.offer()?.price, {
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

        this.formReady.emit(this.offerForm);
    }

    get description() {
        return this.offerForm.get('description');
    }

}
