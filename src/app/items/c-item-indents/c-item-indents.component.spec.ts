import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CItemIndentsComponent } from './c-item-indents.component';

describe('CItemIndentsComponent', () => {
  let component: CItemIndentsComponent;
  let fixture: ComponentFixture<CItemIndentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CItemIndentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CItemIndentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
