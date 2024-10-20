import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'expirydatesFilter'
})
export class ExpiryDatesFilterItemsPipe implements PipeTransform {

   transform(items: any[], itemGuid: string, indentNo: string): any[] {
    if (!items || !itemGuid) {
      return items;
    }
  
    const searchStr = itemGuid.toLowerCase();
    const filteredItems = items.filter(item => item.ItemGuid.toLowerCase() === searchStr && item.IndentNo === indentNo);
    const today = moment();
  
    const result = filteredItems.filter((data: any) => {
      if (data.IsExpirable === false) {
        if (data?.BatchExpiryDate !== null) {
          const date = moment(data?.BatchExpiryDate);
          return date.isValid() && date.isAfter(today);
        }
        return false;
      }
      return true; // Include items with isExpired === true
    });
  
    return result;
  }
  
}
