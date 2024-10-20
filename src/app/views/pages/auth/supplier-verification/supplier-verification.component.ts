import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { SupplierService } from 'src/app/core/Services/supplier.service';

@Component({
  selector: 'app-supplier-verification',
  templateUrl: './supplier-verification.component.html',
  styleUrls: ['./supplier-verification.component.scss']
})
export class SupplierVerificationComponent implements OnInit {

  SupplierGuid:any;
  SupplierDetails:any;
  IsVerify:boolean=false;

  constructor(private authenticationService: AuthenticationService,
    public supplierService: SupplierService, private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.SupplierGuid=this.route.snapshot.params.SupplierGuid;
    if(this.SupplierGuid!="" &&this.SupplierGuid!=undefined){ 
      this.SupplierVerification(this.SupplierGuid);
    }
  }
  SupplierVerification(SupplierGuid:any) {
    this.supplierService.UpdateSupplierStatus(SupplierGuid).subscribe(
      (response) => {
        this.IsVerify=true
      },
      (err) => {
        this.IsVerify=false
      });
      //this.router.navigateByUrl('/suppliers');
  }

}
