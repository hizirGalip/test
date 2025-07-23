import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulsComponent } from './moduls.component';

describe('ModulsComponent', () => {
  let component: ModulsComponent;
  let fixture: ComponentFixture<ModulsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModulsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
