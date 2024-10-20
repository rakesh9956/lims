import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';

@Component({
  selector: 'app-user-not-verified',
  templateUrl: './user-not-verified.component.html',
  styleUrls: ['./user-not-verified.component.scss']
})
export class UserNotVerifiedComponent implements OnInit {
  /**
  * Type:Properties 
  * Declare all the intermediate properies 
  */
  userGuid: any;
  updatedDate: any;
  isVerified: boolean = true;
  /**
   * 
   * @param authenticationService 
   */
  constructor(private authenticationService: AuthenticationService,
    private route: ActivatedRoute) { }
  /**
  * Type : Angular hook 
  * this method is used for on page load functions
  * 
  */
  ngOnInit(): void {
    this.userGuid = this.route.snapshot.params.UserGuid;
    //  this.checkVerificationTime();
  }
  //  /**
  // * Type: ngOnInit calls
  // * 
  // */
  //  checkVerificationTime(){
  //    this.authenticationService.GetUserByGuid(this.userGuid).subscribe(
  //      (data) =>{
  //        this.updatedDate = data?.UpdatedDt==null?data?.CreatedDt:data?.UpdatedDt;
  //        let time = new Date().getTime() - new Date(this.updatedDate).getTime();
  //        this.isVerified=Math.round(((time % 86400000) % 3600000) / 60000)>1?true:false
  //        if(this.isVerified == false){
  //          this.updateVerificationStatus();
  //        }
  //    })
  //  }
  //  /**
  // * Type : Intemediate Service Call
  // * this is fuction is used to update emailconfirm
  // */
  //  updateVerificationStatus(){
  //    this.authenticationService.UpdateEmailConfirmed(this.userGuid).subscribe(
  //      (data:any) => {
  //        if(data.status.toLowerCase() === "success"){
  //        }
  //      },
  //      (err: HttpErrorResponse) => {
  //      })
  //  }
  /**
 * Type : Intemediate Service Call
 * this is fuction is send email verification based on time
 */
  ResndVerification() {
    const now = new Date();
    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    let newUpdatedDate = moment(utc).format('YYYY-MM-DD[T]HH:mm:ss');
    this.authenticationService.ResendEmail(newUpdatedDate, this.userGuid).subscribe((res: any) => {

    })

  }
}
