import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveCptComponent } from './live-cpt.component';

describe('LiveCptComponent', () => {
  let component: LiveCptComponent;
  let fixture: ComponentFixture<LiveCptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveCptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveCptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
