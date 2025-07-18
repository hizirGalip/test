import { Component, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { IsPermitDirective } from '../../../../directives/common/is-permit.directive';

export interface SidebarItem {
  title: string;
  link: string;
  permit: string | string[];
}

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    TranslateModule,
    IsPermitDirective,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() drawer!: MatDrawer;

  // Tek bir seçim için değişkenler
  selectedItem: number | null = null;
  selectedSection: string | null = null;

  items1: SidebarItem[] = [
    {
      title: 'ui_sidebar.pending_surveys',
      link: '/pendingSurveys',
      permit: 'GET.Reading.GetAllSurveyList',
    },
  ];

  toggleSidenav() {
    this.drawer.toggle();
  }

  // Tek bir seçim fonksiyonu
  selectItem(section: string, index: number) {
    if (this.selectedSection === section && this.selectedItem === index) {
      // Zaten seçili olan item'a tıklanırsa seçimi kaldır
      this.selectedItem = null;
      this.selectedSection = null;
    } else {
      // Yeni bir item seç
      this.selectedItem = index;
      this.selectedSection = section;
    }
  }

  // Seçili olup olmadığını kontrol eden yardımcı fonksiyon
  isSelected(section: string, index: number): boolean {
    return this.selectedSection === section && this.selectedItem === index;
  }

  toggleSidebar() {
    this.drawer.toggle();
  }
}
