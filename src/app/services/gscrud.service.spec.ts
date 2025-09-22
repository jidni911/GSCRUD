import { TestBed } from '@angular/core/testing';

import { GscrudService } from './gscrud.service';

describe('GscrudService', () => {
  let service: GscrudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GscrudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
