import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationService } from '../../../../services/models/notification.service';
import { NotificationListResponseDto } from '../../../../contracts/lists/notification';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../services/common/auth.service';
import { SearchService } from '../../../../services/common/search.service';
import { IsPermitDirective } from '../../../../directives/common/is-permit.directive';
import { CreatePermit } from '../../../../abstracts/permit/create-permit';
import { IsPermitService } from '../../../../services/common/is-permit.service';
import { TranslateModule } from '@ngx-translate/core';
import { Language } from '../../../../enums/i18n/language';
import { KarmedTranslateService } from '../../../../services/translation/karmed-translate.service';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  standalone: true,
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
    MatMenuModule,
    MatProgressSpinnerModule,
    FormsModule,
    TranslateModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  @Input() drawer!: MatDrawer;
  notifications: NotificationListResponseDto[] = [];
  loading: boolean = false;
  currentPage: number = 0;
  pageSize: number = 5;
  hasUnreadNotifications: boolean = false;
  currentLang?: Language;
  @Output() menuClick = new EventEmitter<void>();
  profileOpen = false;

  constructor(
    public router: Router,
    private notificationService: NotificationService,
    private authService: AuthService,
    private searchService: SearchService,
    private translate: KarmedTranslateService
  ) {}

  ngOnInit() {
    this.currentLang = this.translate.CurrentLanguage;
    // AuthService'in userId$ observable'ını dinledik
    this.authService.userId$.subscribe((userId) => {
      //oturum açık ise
      if (userId) {
        this.loadNotifications();
        //oturum kapalı ise
      } else {
        this.notifications = []; // Kullanıcı çıkış yaptığında bildirimleri temizle
        this.hasUnreadNotifications = false;
      }
    });
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }

  onMenuClick() {
    console.log('Menu clicked'); // Debug için
    this.menuClick.emit();
  }

  switchLanguage(lang: Language) {
    this.currentLang = lang;
    this.translate.use(lang);
  }

  async loadNotifications() {
    try {
      this.loading = true;
      const response = await this.notificationService.readByProfileId(
        this.currentPage,
        this.pageSize
      );

      if (response?.result?.notificationListResponseDto) {
        this.notifications = response.result.notificationListResponseDto;
        this.hasUnreadNotifications = this.notifications.some((n) => !n.isRead);
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata oluştu:', error);
    } finally {
      this.loading = false;
    }
  }

  async markAsRead(notificationId: string) {
    // Burada bildirimi okundu olarak işaretlemek için gerekli servisi çağırabilirsiniz
    // await this.notificationService.markAsRead(notificationId);
    await this.loadNotifications(); // Listeyi yenile
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  loadMore() {
    this.currentPage++;
    this.loadNotifications();
  }

  toggleSidebar() {
    this.drawer.toggle();
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchService.updateSearchTerm(filterValue);
  }
}
