import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name:'exactNumbers'
})  
export class ExactNumberPipe implements PipeTransform {
  transform(value: number): string {
    // Convert the number to a string without rounding
    let data:any=value?.toString().match(/^\d+(?:\.\d{0,2})?/)
    return data;
  }
}

