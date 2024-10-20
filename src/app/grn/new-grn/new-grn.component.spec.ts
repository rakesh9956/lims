import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewGrnComponent } from './new-grn.component';

describe('NewGrnComponent', () => {
  let component: NewGrnComponent;
  let fixture: ComponentFixture<NewGrnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewGrnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewGrnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
