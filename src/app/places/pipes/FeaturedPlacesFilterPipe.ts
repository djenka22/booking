import {Pipe, PipeTransform} from "@angular/core";
import {PresentedPlace} from "../discover/discover.page";

@Pipe({
    name: "featuredPlaces",
})
export class FeaturedPlacesFilterPipe implements PipeTransform {
    transform(places: PresentedPlace[], featured: boolean): PresentedPlace[] {
        if (!places || places.length === 0) {
            return [];
        }
        if (featured === undefined) {
            return places;
        }

        return places.filter(item => item.place.featured === featured);
    }

}
