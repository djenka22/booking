import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    AlertController,
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
    IonLoading,
    IonMenuButton,
    IonModal,
    IonRow,
    IonSpinner,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {BookingService} from "./booking.service";
import {Booking, CreateBookingDto} from "./booking.model";
import {addIcons} from "ionicons";
import {createOutline, trashOutline} from "ionicons/icons";
import {Subscription} from "rxjs";
import {CreateBookingComponent} from "./create-booking/create-booking.component";

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.page.html',
    styleUrls: ['./bookings.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonMenuButton, IonList, IonGrid, IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonLabel, IonRow, IonCol, IonIcon, IonLoading, IonSpinner, CreateBookingComponent, IonModal]
})
export class BookingsPage implements OnInit, OnDestroy {

    loadedBookings!: Booking[];
    bookingsSubscription!: Subscription;
    bookingsSubscriptionFetch!: Subscription;
    _loadingCancel: boolean = false;
    _loadingUpdate: boolean = false;
    fetchLoading: boolean = true;
    private _bookModalOpen: boolean = false;
    selectedBBookingForUpdate!: Booking
    loadingMessage: string = 'Loading';

    constructor(private bookingsService: BookingService,
                private alertController: AlertController) {
        addIcons({trashOutline})
        addIcons({createOutline})
    }

    ngOnDestroy(): void {
        if (this.bookingsSubscription) {
            this.bookingsSubscription.unsubscribe();
        }
        if (this.bookingsSubscriptionFetch) {
            this.bookingsSubscriptionFetch.unsubscribe();
        }
    }

    ngOnInit() {
        console.log('BookingsPage ngOnInit');
        this.bookingsSubscription = this.bookingsService.bookings.subscribe(bookings => {
            this.loadedBookings = bookings;
        });
    }

    get bookModalOpen() {
        return this._bookModalOpen;
    }

    ionViewWillEnter() {
        console.log('BookingsPage ionViewWillEnter');
        this.fetchLoading = true;
        this.bookingsSubscriptionFetch = this.bookingsService.fetchBookings().subscribe(
            () => {
                console.log('Bookings fetched successfully', this.loadedBookings);
                this.fetchLoading = false;
            }
        );
    }

    get loadingCancel() {
        return this._loadingCancel;
    }

    get loadingUpdate() {
        return this._loadingUpdate;
    }

    async onCancelBooking(bookingId: string, slidingItem: IonItemSliding) {
        this.loadingMessage = 'Cancelling booking...';
        this._loadingCancel = true;
        await this.bookingsService.cancelBooking(bookingId).then(
            () => {
                this._loadingCancel = false;
                slidingItem.close();
                this.presentBookingCanceledAlert();
            }
        );
    }

    async onModalClosed(event: CreateBookingDto) {
        if (event.role === 'cancel') {
            this.closeModal();
            return;
        }

        if (event.bookingData) {
            this.loadingMessage = 'Updating booking...';
            this._loadingUpdate = true;
            if (event.role === 'update' && event.bookingData.existingBookingId) {
                await this.bookingsService.updateBooking(
                    event.bookingData.existingBookingId,
                    event.bookingData.startDate,
                    event.bookingData.endDate,
                    event.bookingData.guestNumber,
                ).then(() => {
                    this._loadingUpdate = false;
                    this.presentBookingEditedAlert();
                });
            }
        }
    }

    closeModal() {
        this._bookModalOpen = false;
    }

    onEditBooking(id: string, slidingItem: IonItemSliding) {
        this.selectedBBookingForUpdate = this.loadedBookings.find(booking => booking.id === id)!;
        this._bookModalOpen = true;
        slidingItem.close();
    }

    private presentBookingEditedAlert() {
        return this.alertController.create({
            header: `${this.selectedBBookingForUpdate.fetchedPlace?.title}`,
            message: 'Your booking has been successfully updated.',
            buttons: [{
                text: 'Okay',
                role: 'destructive',
                handler: () => {
                    this.closeModal();
                }
            }],
        }).then(alert => {
            alert.present();
        })
    }

    private presentBookingCanceledAlert() {
        return this.alertController.create({
            header: `${this.selectedBBookingForUpdate.fetchedPlace?.title}`,
            message: 'Your booking has been successfully canceled.',
            buttons: [{
                text: 'Okay',
                role: 'destructive'
            }],
        }).then(alert => {
            alert.present();
        })
    }
}
