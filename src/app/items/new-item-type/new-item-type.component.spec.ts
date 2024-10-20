import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewItemTypeComponent } from './new-item-type.component';

describe('NewItemTypeComponent', () => {
  let component: NewItemTypeComponent;
  let fixture: ComponentFixture<NewItemTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewItemTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewItemTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
