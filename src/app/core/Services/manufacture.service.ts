import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CONFIGURATION } from 'src/app/app.constant';

@Injectable({
  providedIn: 'root'
})
export class ManufactureService {

  yodaBaseUrl!:string;
  constructor(private http: HttpClient) { 
    this.yodaBaseUrl = CONFIGURATION.baseUrls.yodaBaseUrl;
  }

  //**Get Manufactures */
  getManufacture(  keyword?: string, orderBy: string = "", sortType :string='asc', pageNumber = 1, rowCount = 40,searchType:string=""): Observable<any> {
    const params: any = { keyword, orderBy, sortType, pageNumber, rowCount,searchType};
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Manufacture/GetManufacture`, { params }).pipe(map((res: any = {}) => {
      return res || {};
    }));
  }

  //** Save Manufactures */
  SaveManufacture(body: any): Observable<any> {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Manufacture/SaveManufacture`, body).pipe(map((res: any) => {
        return res || {};
    }));
  }

  //**Edit Call Of Manufacturer */
  getManufactureDetails(ManufactureGuid:any):Observable<any>{
    const params : any ={ManufactureGuid};
    return this.http.get(CONFIGURATION.baseUrls.yodaBaseUrl+'/api/Manufacture/GetManufactureDetails',{params}).pipe(map((res: any) => {
      return res || {};
    }));
  }
  DeleteManufacture(ManufactureGuid:any): Observable<any> {
    let options = {
      ManufactureGuid:ManufactureGuid
    };
    return this.http.post( CONFIGURATION.baseUrls.yodaBaseUrl+'/api/Manufacture/DeleteManufacture',options ).pipe(map((res: any ) => {
      return res;
    }));
  }
}
