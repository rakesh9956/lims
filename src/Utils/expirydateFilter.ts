import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'datesFilter'
})
export class DatesFilterItemsPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
      return items;
    }

    const searchStr = searchText.toLowerCase();
    const filteredItems = items.filter(item => item.ItemGuid.toLowerCase().includes(searchStr));
    const today = moment()

    const result = filteredItems.filter((data: any) => {
        if (data?.BatchExpiryDate !== null) {
          const date = moment(data?.BatchExpiryDate,"DD-MM-YYYY");
          if (date.isValid()) {
          return date.isValid() && date.isAfter(today);
          }
        }
        return false;
    });

    return result;
  }
}
