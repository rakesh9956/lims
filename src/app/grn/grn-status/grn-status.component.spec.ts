import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrnStatusComponent } from './grn-status.component';

describe('GrnStatusComponent', () => {
  let component: GrnStatusComponent;
  let fixture: ComponentFixture<GrnStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GrnStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrnStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
