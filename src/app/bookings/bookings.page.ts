import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
    IonSearchbar,
    IonSpinner,
    IonToolbar
} from '@ionic/angular/standalone';
import {BookingService} from "./booking.service";
import {Booking, BookingDto, BookingFormDto} from "./booking.model";
import {addIcons} from "ionicons";
import {createOutline, searchCircle, trashOutline} from "ionicons/icons";
import {Subscription} from "rxjs";
import {CreateBookingComponent} from "./create-booking/create-booking.component";

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.page.html',
    styleUrls: ['./bookings.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, IonButtons, IonMenuButton, IonList, IonGrid, IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonLabel, IonRow, IonCol, IonIcon, IonLoading, IonSpinner, CreateBookingComponent, IonModal, IonSearchbar]
})
export class BookingsPage implements OnInit, OnDestroy {

    @ViewChild('searchbar') ionSearchbar!: IonSearchbar;

    loadedBookings!: Booking[];
    presentedBookings!: Booking[];
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
        addIcons({trashOutline});
        addIcons({createOutline});
        addIcons({ searchCircle });
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
            this.presentedBookings = this.loadedBookings;
        });
    }

    get bookModalOpen() {
        return this._bookModalOpen;
    }

    ionViewWillEnter() {
        this.ionSearchbar.value = '';

        this.fetchLoading = true;
        this.bookingsSubscriptionFetch = this.bookingsService.fetchBookings().subscribe(
            () => {
                console.log('Bookings fetched');
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

    onDeleteOffer(bookingId: string, slidingItem: IonItemSliding) {
        this.alertController.create({
            header: 'Are you sure?',
            message: 'Are you sure you want to cancel this booking?',
            buttons: [
                {
                    text: 'Back',
                    role: 'cancel',
                    handler: () => {
                        slidingItem.close();
                    }
                },
                {
                    text: 'Cancel Booking',
                    role: 'destructive',
                    handler: async () => await this.onCancelBooking(bookingId)
                }]
        }).then(alert => {
            alert.present();
        })
    }


    async onCancelBooking(bookingId: string) {
        await this.bookingsService.cancelBooking(bookingId).then(
            () => {
               this.alertController.create({
                   header: 'Done',
                   message: 'Your booking has been successfully canceled.',
                   buttons: [{
                       text: 'Okay',
                   }],
               }).then(alert => {
                   alert.present();
               })
            }
        );
    }

    async onModalClosed(event: BookingFormDto) {
        if (event.role === 'cancel') {
            this.closeModal();
            return;
        }

        if (event.bookingData) {
            this.loadingMessage = 'Updating booking...';
            this._loadingUpdate = true;
            if (event.role === 'update' && event.bookingData.existingBookingId) {
                await this.bookingsService.updateBooking(
                    new BookingDto({
                        id: event.bookingData.existingBookingId,
                        bookedFrom: event.bookingData.startDate,
                        bookedTo: event.bookingData.endDate,
                        guestNumber: event.bookingData.guestNumber,
                    })
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

    onClearSearch() {
        this.presentedBookings = this.loadedBookings;
    }

    onSearchChange(event: any) {
        const keywords: string = event.target.value;
        if (!keywords || keywords.trim() === '') {
            this.onClearSearch();
            return;
        }

        this.bookingsService.searchBookings(keywords)
            .pipe()
            .subscribe((bookings: Booking[]) => {
                this.presentedBookings = bookings;
            })
    }

    private presentBookingEditedAlert() {
        return this.alertController.create({
            header: 'Cancelled',
            message: 'Your booking has been successfully updated.',
            buttons: [{
                text: 'Okay',
                handler: () => {
                    this.closeModal();
                }
            }],
        }).then(alert => {
            alert.present();
        })
    }
}
