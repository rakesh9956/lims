import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import{Workbook}from 'exceljs';
// import*as fs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  generateExcel: any;

  constructor(
    private http: HttpClient,
  ) { }
  getExcelFile(): Observable<Blob> {
    return this.http.get('https://example.com/excel', { responseType: 'blob' });
  }

}
