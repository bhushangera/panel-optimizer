import { TestBed } from '@angular/core/testing';

import { GuillotineService } from './guillotine.service';

describe('GuillotineService', () => {
  let service: GuillotineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuillotineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
