import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GlobalService } from './core/Services/global.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'nobleui-angular';
  isSpinning = false; // Falg for spinner

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private globalService: GlobalService) {
    }

  ngOnInit(): void {}

  ngAfterContentChecked(): void {
    this.globalService.spinner.subscribe((spinner: boolean) => {
      this.isSpinning = spinner;
    });
    this.changeDetectorRef.detectChanges();
  }

}
