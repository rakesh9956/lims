import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DpConsumptionComponent } from './dp-consumption.component';

describe('DpConsumptionComponent', () => {
  let component: DpConsumptionComponent;
  let fixture: ComponentFixture<DpConsumptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DpConsumptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DpConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
