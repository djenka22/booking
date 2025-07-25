export class DateUtilsService {

    public static getDatesInRange(startDate: Date, endDate: Date): string[] {
        const dates: string[] = [];
        let currentDateNormalized = new Date(startDate);
        currentDateNormalized.setUTCHours(0, 0, 0, 0);
        const endDateNormalized = new Date(endDate);
        endDateNormalized.setUTCHours(0, 0, 0, 0);

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
}
