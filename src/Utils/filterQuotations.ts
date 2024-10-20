import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';




@Pipe({
    name: 'FilterQuotationsItemsPipe'
  })

  export class FilterQuotationsItemsPipe implements PipeTransform {
   
    transform(items: any, searchText: string): any[] {
      const currentDate: any = new Date();
      if (!items || !searchText) {
        return items;
      }
    
      searchText = searchText;
      
      let FilterData: any = items.filter((item: any) =>
        item.groupItem.some((data:any)=>data.ItemGuid == searchText &&
          moment(currentDate, 'MM/DD/YYYY HH:mm:ss').isBetween(
            moment(data.EntryDateFrom),
            moment(data.EntryDateTo)
        )));
      return FilterData[0].groupItem;
    }
  }