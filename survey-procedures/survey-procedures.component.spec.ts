import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyProceduresComponent } from './survey-procedures.component';

describe('SurveyProceduresComponent', () => {
  let component: SurveyProceduresComponent;
  let fixture: ComponentFixture<SurveyProceduresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyProceduresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyProceduresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
