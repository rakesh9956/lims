import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoReportComponent } from './po-report.component';

describe('PoReportComponent', () => {
  let component: PoReportComponent;
  let fixture: ComponentFixture<PoReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
