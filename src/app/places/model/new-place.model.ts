
export class NewPlace {
    id?: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    featured: boolean
    availableFrom: Date;
    availableTo: Date;
    userId: string


    constructor(title: string, description: string, imageUrl: string, price: number, featured: boolean, availableFrom: Date, availableTo: Date, userId: string, id?: string) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.price = price;
        this.featured = featured;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
        this.userId = userId;
    }
}
