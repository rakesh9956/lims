import { Component, Input, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';

@Component({
  selector: 'app-c-item-details',
  templateUrl: './c-item-details.component.html',
  styleUrls: ['./c-item-details.component.scss']
})
export class CItemDetailsComponent implements OnInit {
  @Input()  ItemData : any[];

  constructor(public authService:AuthenticationService) { }

  ngOnInit(): void {
  }

}
