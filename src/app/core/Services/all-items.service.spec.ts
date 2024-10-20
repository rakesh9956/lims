import { TestBed } from '@angular/core/testing';

import { AllItemsService } from './all-items.service';

describe('AllItemsService', () => {
  let service: AllItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
