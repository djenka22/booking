import {Component, input, OnInit} from '@angular/core';
import {IonItem, IonLabel, IonSpinner, IonText, Platform} from "@ionic/angular/standalone";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {BookingService} from "../booking.service";
import {Place} from "../../places/model/place.model";
import {Booking} from "../booking.model";
import {switchMap, take, tap} from "rxjs";
import {AuthService, UserData} from "../../auth/auth.service";
import {DatePipe} from "@angular/common";

@Component({
    selector: 'app-booking-item',
    templateUrl: './booking-item.component.html',
    styleUrls: ['./booking-item.component.scss'],
    imports: [
        IonItem,
        CdkVirtualScrollViewport,
        IonLabel,
        CdkFixedSizeVirtualScroll,
        CdkVirtualForOf,
        IonText,
        DatePipe,
        IonSpinner,
    ]
})
export class BookingItemComponent implements OnInit {

    place = input.required<Place>();
    bookingsWithUser?: BookingWithUser[];

    fetchLoading: boolean = false;

    currentScreenWidth!: number;
    currentScreenHeight!: number;

    // Virtual scroll properties
    virtualItemSize: number = 72; // Default
    minBuffer: number = 720;     // Default
    maxBuffer: number = 1500;    // Default

    constructor(private bookingsService: BookingService,
                private authService: AuthService,
                private platform: Platform) {
    }

    ngOnInit() {
        this.fetchLoading = true;
        let bookings = new Map<string,Booking>();
        this.bookingsService.findAllBookingsByPlaceIdAfterBookedToDate(this.place().id, new Date())
            .pipe(
                switchMap(fetchedBookings => {
                    for (let booking of fetchedBookings) {
                            bookings.set(booking.user.id, booking);
                    }
                    return this.authService.findUsersByIds(fetchedBookings.map(booking => booking.user.id)).pipe(take(1));
                }),
                tap(users => {
                    let bookingsWithUser: BookingWithUser[] = [];
                    users.map(user => {
                        if (bookings.has(user.id)) {
                            bookingsWithUser.push({
                                booking: bookings.get(user.id)!,
                                user: user
                            });
                        }
                    });
                    this.bookingsWithUser = bookingsWithUser;
                })
            ).subscribe(
            () => {
                this.updateVirtualScrollProps();
                this.fetchLoading = false
            }
        );
        this.platform.resize.subscribe(() => {
            this.updateVirtualScrollProps();
        });
    }

    private updateVirtualScrollProps() {
        this.currentScreenWidth = this.platform.width();
        this.currentScreenHeight = this.platform.height();

        // Dynamically adjust itemSize
        if (this.currentScreenWidth < 576) { // e.g., small phones
            this.virtualItemSize = 60;
        } else if (this.currentScreenWidth < 768) { // e.g., larger phones/small tablets
            this.virtualItemSize = 72;
        } else { // e.g., tablets/desktops
            this.virtualItemSize = 85;
        }

        // Dynamically adjust buffer sizes based on screen height or width
        // A common strategy is to make them multiples of the screen height
        this.minBuffer = this.currentScreenHeight * 1.5; // Render 1.5 screen heights worth of content
        this.maxBuffer = this.currentScreenHeight * 2.5; // Render up to 2.5 screen heights worth of content

        // Or, if your items are horizontal and width is more relevant for buffer:
        // this.minBuffer = this.currentScreenWidth * 1.5;
        // this.maxBuffer = this.currentScreenWidth * 2.5;

        console.log(`Screen: ${this.currentScreenWidth}x${this.currentScreenHeight}, ItemSize: ${this.virtualItemSize}, MinBuffer: ${this.minBuffer}, MaxBuffer: ${this.maxBuffer}`);
    }
}

interface BookingWithUser {
    booking: Booking;
    user: UserData;
}
