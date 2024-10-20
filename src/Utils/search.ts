import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';




@Pipe({
    name: 'filterItems'
  })

  export class FilterItemsPipe implements PipeTransform {
   
    transform(items: any, searchText: string): any[] {
      if (!items || !searchText) {
        return items;
      }
    
      searchText = searchText;
      
      let FilterData: any = items.filter((item: any) =>item.ItemGuid == searchText &&  item.ApprovalStatus==2 && item.IsDeleted==0 );
      return FilterData;
    }
  }