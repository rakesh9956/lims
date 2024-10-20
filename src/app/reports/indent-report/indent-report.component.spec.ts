import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndentReportComponent } from './indent-report.component';

describe('IndentReportComponent', () => {
  let component: IndentReportComponent;
  let fixture: ComponentFixture<IndentReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndentReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
