import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CItemActivityComponent } from './c-item-activity.component';

describe('CItemActivityComponent', () => {
  let component: CItemActivityComponent;
  let fixture: ComponentFixture<CItemActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CItemActivityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CItemActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
