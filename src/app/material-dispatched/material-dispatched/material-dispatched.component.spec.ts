import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialDispatchedComponent } from './material-dispatched.component';

describe('MaterialDispatchedComponent', () => {
  let component: MaterialDispatchedComponent;
  let fixture: ComponentFixture<MaterialDispatchedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialDispatchedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialDispatchedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
