import { TestBed } from '@angular/core/testing';

import { StoreLocationsService } from './store-locations.service';

describe('StoreLocationsService', () => {
  let service: StoreLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
