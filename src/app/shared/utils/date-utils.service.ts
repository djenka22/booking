export class DateUtilsService {

    public static getDatesInRange(startDate: Date, endDate: Date): string[] {
        const dates: string[] = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
            const day = currentDate.getDate().toString().padStart(2, '0');
            dates.push(`${year}-${month}-${day}`);
            currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
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
