import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrnAgainstPoComponent } from './grn-against-po.component';

describe('GrnAgainstPoComponent', () => {
  let component: GrnAgainstPoComponent;
  let fixture: ComponentFixture<GrnAgainstPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GrnAgainstPoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrnAgainstPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
