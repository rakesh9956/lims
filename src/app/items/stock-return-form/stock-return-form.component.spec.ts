import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockReturnFormComponent } from './stock-return-form.component';

describe('StockReturnFormComponent', () => {
  let component: StockReturnFormComponent;
  let fixture: ComponentFixture<StockReturnFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockReturnFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockReturnFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
