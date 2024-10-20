import { TestBed } from '@angular/core/testing';

import { NgbdateFormatService } from './ngbdate-format.service';

describe('NgbdateFormatService', () => {
  let service: NgbdateFormatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgbdateFormatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
