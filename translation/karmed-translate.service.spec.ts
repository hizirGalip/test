import { TestBed } from '@angular/core/testing';

import { KarmedTranslateService } from './karmed-translate.service';

describe('KarmedTranslateService', () => {
  let service: KarmedTranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KarmedTranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
