import {Component, ElementRef, OnInit, output, ViewChild} from '@angular/core';
import {IonButton, IonIcon, IonImg, IonLabel, Platform} from "@ionic/angular/standalone";
import {addIcons} from "ionicons";
import {imageOutline} from "ionicons/icons";
import {Camera, CameraResultType, CameraSource} from "@capacitor/camera";
import {Capacitor} from "@capacitor/core";

@Component({
    selector: 'app-image-picker',
    templateUrl: './image-picker.component.html',
    styleUrls: ['./image-picker.component.scss'],
    imports: [
        IonImg,
        IonButton,
        IonIcon,
        IonLabel
    ]
})
export class ImagePickerComponent implements OnInit {

    @ViewChild('filePicker') filePickerRef?: ElementRef<HTMLInputElement>;

    imagePick = output<string | File>();
    usePicker: boolean = false;
    selectedImage?: string;

    constructor(private platform: Platform) {
        addIcons({imageOutline})
    }

    ngOnInit() {
        if (this.platform.is('desktop') || (this.platform.is('mobile') && !this.platform.is('hybrid')) ) {
            this.usePicker = true;
        }
    }

    onPickImage() {
        if (!Capacitor.isPluginAvailable('Camera') || this.usePicker) {
            this.filePickerRef?.nativeElement.click();
            return;
        }
        Camera.getPhoto({
            source: CameraSource.Prompt,
            quality: 50,
            resultType: CameraResultType.DataUrl, //(DataUrl)
            correctOrientation: true,
            width: 600
        }).then(image => {
            console.log('ola');
          this.selectedImage = image.dataUrl; //(image.dataUrl)
          if (this.selectedImage) {
            this.imagePick.emit(this.selectedImage);
          }
        }).catch(error => {
            console.log(error);
            return false;
        })
    }

    onFileChosen(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files || target.files.length <= 0) {
            return;
        }
        const file = target.files[0];

        const fileReader = new FileReader();
        fileReader.onload = () => {
            const dataUrl = fileReader.result?.toString();
            if (!dataUrl) {
                return;
            }
            this.selectedImage = dataUrl;
            this.imagePick.emit(file);
        }
        fileReader.readAsDataURL(file);
    }

}
