import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Language } from '../../../../enums/i18n/language';
import { KarmedTranslateService } from '../../../../services/translation/karmed-translate.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @Input() drawer!: MatDrawer;
  currentLang?: Language;
  // createPermit: string = "POST.Writing.AssignRoleEndpoint";

  constructor(
    public router: Router,
    private translate: KarmedTranslateService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translate.CurrentLanguage;
  }

  switchLanguage(lang: Language) {
    this.currentLang = lang;
    this.translate.use(lang);
  }

  toggleSidebar() {
    this.drawer.toggle();
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
