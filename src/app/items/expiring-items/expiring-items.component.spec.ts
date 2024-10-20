import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiringItemsComponent } from './expiring-items.component';

describe('ExpiringItemsComponent', () => {
  let component: ExpiringItemsComponent;
  let fixture: ComponentFixture<ExpiringItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpiringItemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiringItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
