import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveCptReportComponent } from './live-cpt-report.component';

describe('LiveCptReportComponent', () => {
  let component: LiveCptReportComponent;
  let fixture: ComponentFixture<LiveCptReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveCptReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveCptReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
