import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { CONFIGURATION } from 'src/app/app.constant';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  yodaBaseUrl!: string;

  constructor(private http: HttpClient) {
    this.yodaBaseUrl = CONFIGURATION.baseUrls.yodaBaseUrl

   }


   GetDashBoardData(SelectedParam: any,UserLocationGuid:any) {
    const params: any = { SelectedParam,UserLocationGuid}
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/DashBoard/GetDashboardData`, { params }).pipe(map((res: any) => {
      return res || [];
    }));
  }
}
