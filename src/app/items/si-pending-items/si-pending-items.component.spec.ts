import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiPendingItemsComponent } from './si-pending-items.component';

describe('SiPendingItemsComponent', () => {
  let component: SiPendingItemsComponent;
  let fixture: ComponentFixture<SiPendingItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiPendingItemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiPendingItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
