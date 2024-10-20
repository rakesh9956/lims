import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NrdcComponent } from './nrdc.component';

describe('NrdcComponent', () => {
  let component: NrdcComponent;
  let fixture: ComponentFixture<NrdcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NrdcComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NrdcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
