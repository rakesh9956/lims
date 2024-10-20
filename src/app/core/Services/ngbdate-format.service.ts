import { Injectable } from '@angular/core';
import {NgbDateParserFormatter,NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '-';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    if (date) {
      const day = date.day < 10 ? '0' + date.day : date.day;
      const month = date.month < 10 ? '0' + date.month : date.month;
      const year = date.year;
      return day + this.DELIMITER + month + this.DELIMITER + year;
    }
    return '';
  }
}
export class NgbdateFormatService {

  constructor() { }
}
