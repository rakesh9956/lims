import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoAgainstPiComponent } from './po-against-pi.component';

describe('PoAgainstPiComponent', () => {
  let component: PoAgainstPiComponent;
  let fixture: ComponentFixture<PoAgainstPiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoAgainstPiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoAgainstPiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
