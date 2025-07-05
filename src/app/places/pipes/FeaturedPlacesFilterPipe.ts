import {Pipe, PipeTransform} from "@angular/core";
import {Place} from "../place.model";

@Pipe({
    name: "featuredPlaces",
})
export class FeaturedPlacesFilterPipe implements PipeTransform {
    transform(places: Place[], featured: boolean): Place[] {
        if (!places || places.length === 0) {
            return [];
        }
        if (featured === undefined) {
            return places;
        }

        return places.filter(item => item.featured === featured);
    }

}
