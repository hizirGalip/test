import { Component } from '@angular/core';
import { Tab1Component } from './tab1/tab1.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-center',
  imports: [CommonModule, RouterModule, Tab1Component],
  templateUrl: './center.component.html',
  styleUrl: './center.component.scss',
})
export class CenterComponent {}
