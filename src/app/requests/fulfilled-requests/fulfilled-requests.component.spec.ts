import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FulfilledRequestsComponent } from './fulfilled-requests.component';

describe('FulfilledRequestsComponent', () => {
  let component: FulfilledRequestsComponent;
  let fixture: ComponentFixture<FulfilledRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FulfilledRequestsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FulfilledRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
