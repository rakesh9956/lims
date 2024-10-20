import { TestBed } from '@angular/core/testing';

import { UserPermissionLocationsService } from './user-permission-locations.service';

describe('UserPermissionLocationsService', () => {
  let service: UserPermissionLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserPermissionLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
