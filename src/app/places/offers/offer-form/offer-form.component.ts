import {ChangeDetectorRef, Component, input, OnInit, output} from '@angular/core';
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
import {ImagePickerComponent} from "../../../shared/pickers/image-picker/image-picker.component";
import {FileUtilsService} from "../../../shared/file-utils.service";

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
        ReactiveFormsModule,
        ImagePickerComponent
    ]
})
export class OfferFormComponent implements OnInit {

    offerForm!: FormGroup;
    offer = input<Place>();
    formReady = output<FormGroup>();
    currentDate = new Date().toISOString();

    constructor(private formBuilder: FormBuilder,
                private cdRef: ChangeDetectorRef) {
    }

    ngOnInit() {
        const dateFrom = this.offer()?.availableFrom.toDate().toISOString() || this.currentDate;
        const dateTo = this.offer()?.availableTo.toDate().toISOString() || this.currentDate;

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
            availableFrom: [dateFrom, {
                updateOn: 'blur',
                validators: [Validators.required]
            }],
            availableTo: [dateTo, {
                updateOn: 'blur',
                validators: [Validators.required]
            }],
            image: [null]
        })

        this.formReady.emit(this.offerForm);
        this.cdRef.detectChanges();
    }

    get description() {
        return this.offerForm.get('description');
    }

    onDateFromChange(event: CustomEvent) {
        const newDateFrom = event.detail.value;

        const currentAvailableToControl = this.offerForm.get('availableTo');
        const currentAvailableToValue = currentAvailableToControl?.value;

        if (new Date(newDateFrom) > new Date(currentAvailableToValue)) {
            currentAvailableToControl?.setValue(newDateFrom); // Update the form control directly
        }
    }

    onImagePick(imageData: string | File) {
        let imageFile;
        if (typeof imageData === 'string') {
            try {
                imageFile = FileUtilsService.dataUrlToBlob(imageData, 'image/jpeg');
            } catch (error) {
                console.error('Error processing image data:', error);
                return;
            }
        } else {
            imageFile = imageData;
        }

        this.offerForm.patchValue({image: imageFile});
    }
}
