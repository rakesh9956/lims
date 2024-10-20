import { TestBed } from '@angular/core/testing';

import { AllReportsService } from './all-reports.service';

describe('AllReportsService', () => {
  let service: AllReportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
