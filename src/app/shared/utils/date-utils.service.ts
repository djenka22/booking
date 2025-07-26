export class DateUtilsService {

    public static getDatesInRange(startDate: Date, endDate: Date): string[] {
        const dates: string[] = [];
        let currentDateNormalized = this.normalizeDateToMidnight(new Date(startDate));
        const endDateNormalized = this.normalizeDateToMidnight(new Date(endDate));

        while (currentDateNormalized <= endDateNormalized) {
            const year = currentDateNormalized.getFullYear();
            const month = (currentDateNormalized.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
            const day = currentDateNormalized.getDate().toString().padStart(2, '0');
            dates.push(`${year}-${month}-${day}`);
            currentDateNormalized.setDate(currentDateNormalized.getDate() + 1); // Move to the next day
        }
        return dates;
    }

    public static formatDateToYYYYMMDD(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    public static findFirstAvailableDate(
        placeAvailableFrom: Date,
        placeAvailableTo: Date,
        disabledDates: Set<string>
    ): Date | null {
        let searchStartDate = new Date();

        if (searchStartDate < placeAvailableFrom) {
            searchStartDate = new Date(placeAvailableFrom);
        }

        let currentDate = new Date(searchStartDate);

        while (currentDate <= placeAvailableTo) {
            const formattedDate = this.formatDateToYYYYMMDD(currentDate);
            if (!disabledDates.has(formattedDate)) {
                return currentDate;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return null;
    }

    public static normalizeDateToMidnight(date: Date): Date {
        date.setHours(0, 0, 0, 0);
        return date;
    }

}
