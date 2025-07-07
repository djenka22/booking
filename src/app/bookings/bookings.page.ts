import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonMenuButton,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import {BookingService} from "./booking.service";
import {Booking} from "./booking.model";
import {addIcons} from "ionicons";
import {trashOutline} from "ionicons/icons";

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonMenuButton, IonList, IonGrid, IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonLabel, IonRow, IonCol, IonIcon]
})
export class BookingsPage implements OnInit {

  loadedBookings!: Booking[];

  constructor(private bookingsService: BookingService) {
    addIcons({trashOutline})
  }

  ngOnInit() {
    this.loadedBookings = this.bookingsService.bookings;
  }

  onCancelBooking(bookingId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    // cancel booking
  }
}
