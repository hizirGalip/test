import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionPagesComponent } from './transaction-pages.component';

describe('TransactionPagesComponent', () => {
  let component: TransactionPagesComponent;
  let fixture: ComponentFixture<TransactionPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionPagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
