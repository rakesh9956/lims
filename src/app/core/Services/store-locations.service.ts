import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CONFIGURATION } from 'src/app/app.constant';

@Injectable({
  providedIn: 'root'
})
export class StoreLocationsService {
  yodhBaseUrl: string;

  constructor(private http:HttpClient) {
    this.yodhBaseUrl = CONFIGURATION.baseUrls.yodaBaseUrl
   }

   GetAllCentres(params = {} as any): Observable<any> {
    return this.http.get<any>(`${this.yodhBaseUrl}/api/Store/GetAllCentres`,{params}).pipe(map((res:any={}) => {
      return res || {}
    }))
  }

   saveCentreDetails(params = {} as any): Observable<any> {
    return this.http.post<any>(`${this.yodhBaseUrl}/api/Store/SaveCentreDetails`,params).pipe(map((res:any={}) => {
      return res || {}
    }))
  }

  GetAddCentreDefaults() {
    return this.http.get<any>(`${this.yodhBaseUrl}/api/store/GetAddCentreDefaults`).pipe(map((res:any) => {
      return res || {}
    }))
  }

  GetCentreLocation(params = {} as any):Observable<any> {
    return this.http.get<any>(`${this.yodhBaseUrl}/api/Store/GetCentreLocation`, { params }).pipe(map((res: any={}) => {
      return res || {}
    }))
  }

  SaveLocationDetail(params= {} as any):Observable<any> {
    return this.http.post<any>(`${this.yodhBaseUrl}/api/Store/SavePanelLocationDetails`,params).pipe(map((res:any={}) => {
      return res || {}
    }))
  }

  GetCentreTypeDefault(params = {} as any):Observable<any> {
    return this.http.get<any>(`${this.yodhBaseUrl}/api/Store/GetCentreTypeDefault`, { params }).pipe(map((res: any={}) => {
      return res || {}
    }))
  } 

  getEditCentre(params = {} as any):Observable<any> {
    return this.http.get<any>(`${this.yodhBaseUrl}/api/Store/GetCentreDetails`, {params}).pipe(map((res:any={}) => {
      return res || {}
    }))
  }

  deleteStore(params = {} as any):Observable<any>  {
    return this.http.post<any>(`${this.yodhBaseUrl}/api/Store/DeleteLocation`, params).pipe(map((res:any={}) => {
      return res || {}
    }))
  }

  deleteCenter(params = {} as any):Observable<any>  {
    return this.http.post<any>(`${this.yodhBaseUrl}/api/Store/DeleteCenter`, params).pipe(map((res:any={}) => {
      return res || {}
    }))
  }

  UpdateCenterLocation(params = {} as any):Observable<any>  {
    return this.http.post<any>(`${this.yodhBaseUrl}/api/Store/UpdateLocationCenter`, params).pipe(map((res:any={}) => {
      return res || {}
    }))
  }

  GetLocationByGuid():Observable<any> {
    return this.http.get<any>(`${this.yodhBaseUrl}/api/Store/GetCenterLocationsByGuid`).pipe(map((res:any={}) => {
      return res || {}
    }))

  }
  saveXMLLocationDetails(params : any ):Observable<any>{
    const body = {
      uploadCenterLocationXMLList : params
    }
    return this.http.post<any>(`${this.yodhBaseUrl}/api/Store/SaveXMLPanelLocationDetails` , body).pipe(map((res:any={}) => {

  }))
    }
  
}