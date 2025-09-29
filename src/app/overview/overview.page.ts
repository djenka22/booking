import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    IonBadge,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonDatetime,
    IonDatetimeButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenuButton,
    IonPopover,
    IonRow,
    IonSpinner,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {OverviewService} from "./overview.service";
import {AuthService} from "../auth/auth.service";
import {forkJoin, map, Subscription, switchMap, take, tap} from "rxjs";
import {PlaceBookingOverview, PlaceWithDaysDto} from "../places/model/place.model";
import {addIcons} from "ionicons";
import {informationCircleOutline} from "ionicons/icons";
import {DateUtilsService} from "../shared/utils/date-utils.service";

@Component({
    selector: 'app-overview',
    templateUrl: './overview.page.html',
    styleUrls: ['./overview.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonGrid, IonCardContent, IonCol, IonRow, IonList, IonItem, IonLabel, IonBadge, IonIcon, IonSpinner, IonDatetime, IonPopover, IonDatetimeButton]
})
export class OverviewPage implements OnInit, OnDestroy {

    today = new Date();
    currentMonth = this.today.getMonth();
    currentYear = this.today.getFullYear();

    placesSubscription!: Subscription

    placesCount!: number;
    placesAvailability!: PlaceWithDaysDto[];
    availablePlacesCurrentMonth!: number;
    allPlaces: PlaceBookingOverview[] = [];

    selectedDate: string = DateUtilsService.toLocalDateISO(this.today);

    loading!: boolean;
    authenticatedUserId!: string;

    constructor(private overviewService: OverviewService,
                private authService: AuthService) {
        addIcons({informationCircleOutline})
    }

    ngOnDestroy(): void {
        if (this.placesSubscription) {
            this.placesSubscription.unsubscribe();
        }
    }

    ngOnInit() {

        this.loading = true;

        this.placesSubscription = this.authService.userId.pipe(
            take(1),
            switchMap(userId => {
                if (!userId) throw new Error('User not authenticated');
                this.authenticatedUserId = userId;
                return this.overviewService.getPlacesAvailability(this.authenticatedUserId, new Date())
            }),
            switchMap(availablePlaces => {
                this.placesAvailability = availablePlaces;
                this.availablePlacesCurrentMonth = availablePlaces.filter(p => p.daysCount > 0).length;
                return this.overviewService.getPlacesCount(this.authenticatedUserId)
            }),
            switchMap(placesCount => {
                this.placesCount = placesCount;

                // Call your same method for different periods
                return forkJoin([
                    this.overviewService.getReservationsCountByPlace(this.authenticatedUserId, this.getCurrentMonthStart(), this.getCurrentMonthEnd()),
                    this.overviewService.getReservationsCountByPlace(this.authenticatedUserId, this.getLastMonthStart(), this.getLastMonthEnd()),
                    this.overviewService.getReservationsCountByPlace(this.authenticatedUserId, this.getThisYearStart(), this.getThisYearEnd()),
                    this.overviewService.getReservationsCountByPlace(this.authenticatedUserId, this.getLastYearStart(), this.getLastYearEnd())
                ]);
            }),
            map(([thisMonth, lastMonth, thisYear, lastYear]) => {
                const allPlaceTitles = new Set([
                    ...thisMonth.map(p => p.placeTitle),
                    ...lastMonth.map(p => p.placeTitle),
                    ...thisYear.map(p => p.placeTitle),
                    ...lastYear.map(p => p.placeTitle)
                ]);

                const merged: PlaceBookingOverview[] = [];

                allPlaceTitles.forEach(title => {
                    merged.push({
                        placeTitle: title,
                        daysThisMonth: thisMonth.find(p => p.placeTitle === title)?.daysCount || 0,
                        daysLastMonth: lastMonth.find(p => p.placeTitle === title)?.daysCount || 0,
                        daysThisYear: thisYear.find(p => p.placeTitle === title)?.daysCount || 0,
                        daysLastYear: lastYear.find(p => p.placeTitle === title)?.daysCount || 0
                    });
                });

                return merged;
            }),
            tap(result => this.allPlaces = result.sort((a, b) => b.daysThisMonth - a.daysThisMonth))
        ).subscribe(() => {
            this.loading = false;
        });
    }

    getCurrentMonthStart() {
        console.log("currentYear", this.currentYear);
        console.log("currentMonth", this.currentMonth);
        console.log("currentMonthStart", new Date(this.currentYear, this.currentMonth, 1).toISOString() );
        return new Date(this.currentYear, this.currentMonth, 1);
    }

    getCurrentMonthEnd() {
        return new Date(this.currentYear, this.currentMonth + 1, 0, 23, 59, 59, 999);
    }

    getLastMonthStart() {
        const lastMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
        const lastMonthYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
        return new Date(lastMonthYear, lastMonth, 1);
    }

    getLastMonthEnd() {
        const lastMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
        const lastMonthYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
        return new Date(lastMonthYear, lastMonth + 1, 0, 23, 59, 59, 999);
    }

    getThisYearStart() {
        return new Date(this.currentYear, 0, 1);
    }

    getThisYearEnd() {
        return new Date(this.currentYear, 11, 31, 23, 59, 59, 999);
    }

    getLastYearStart() {
        return new Date(this.currentYear - 1, 0, 1);
    }

    getLastYearEnd() {
        return new Date(this.currentYear - 1, 11, 31, 23, 59, 59, 999);
    }

    onDatePopoverDismiss() {
        this.overviewService.getPlacesAvailability(this.authenticatedUserId, new Date(this.selectedDate)).pipe(
            take(1)
        ).subscribe(availablePlaces => {
            console.log(availablePlaces);
            this.placesAvailability = availablePlaces;
        })
    }

    protected readonly DateUtilsService = DateUtilsService;
}
