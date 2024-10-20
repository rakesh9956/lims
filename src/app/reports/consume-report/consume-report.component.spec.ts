import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumeReportComponent } from './consume-report.component';

describe('ConsumeReportComponent', () => {
  let component: ConsumeReportComponent;
  let fixture: ComponentFixture<ConsumeReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumeReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
