import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareQuotationsComponent } from './compare-quotations.component';

describe('CompareQuotationsComponent', () => {
  let component: CompareQuotationsComponent;
  let fixture: ComponentFixture<CompareQuotationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompareQuotationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareQuotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
