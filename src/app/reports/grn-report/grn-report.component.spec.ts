import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrnReportComponent } from './grn-report.component';

describe('GrnReportComponent', () => {
  let component: GrnReportComponent;
  let fixture: ComponentFixture<GrnReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GrnReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrnReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
