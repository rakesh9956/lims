import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapItemsComponent } from './scrap-items.component';

describe('ScrapItemsComponent', () => {
  let component: ScrapItemsComponent;
  let fixture: ComponentFixture<ScrapItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrapItemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrapItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
