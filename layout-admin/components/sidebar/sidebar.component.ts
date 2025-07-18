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
import { IsPermitDirective } from '../../../../directives/common/is-permit.directive';
import { TranslateModule } from '@ngx-translate/core';

export interface SidebarItem {
  title: string;
  link: string;
  permit: string | string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
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

  sectionStates: { [key: string]: boolean } = {
    categories: true,
    users: false,
    roles: false,
    institutions: false,
    authorization: false,
    contents: false,
    tags: false,
    topics: false,
    ratings: false,
    comments: false,
    notifications: false,
    userProfiles: false,
    programSettings: false,
  };

  toggleSection(sectionName: string) {
    this.sectionStates[sectionName] = !this.sectionStates[sectionName];
  }

  // Tek bir seçim için değişkenler
  selectedItem: number | null = null;
  selectedSection: string | null = null;

  items1: SidebarItem[] = [
    {
      title: 'ADMIN_SIDEBAR.CATEGORIES.MAIN_CATEGORIES',
      link: '/admin/mainCategories',
      permit: 'GET.Reading.GetMainCategoryList',
    },
    {
      title: 'ADMIN_SIDEBAR.CATEGORIES.ALL_CATEGORIES',
      link: '/admin/allCategories',
      permit: 'GET.Reading.GetAllCategoryList',
    },
  ];

  items2: SidebarItem[] = [
    {
      title: 'ADMIN_SIDEBAR.USERS.ALL_USERS',
      link: '/admin/allUsers',
      permit: 'GET.Reading.GetAllUsers',
    },
    {
      title: 'ADMIN_SIDEBAR.USERS.USER_ROLES',
      link: '/admin/userRoles',
      permit: 'GET.Reading.GetAllUsers',
    },
  ];

  items3: SidebarItem[] = [
    {
      title: 'ADMIN_SIDEBAR.ROLES.ROLE_OPERATIONS',
      link: '/admin/roles',
      permit: 'GET.Reading.GetRoles',
    },
  ];

  items4: SidebarItem[] = [
    {
      title: 'ADMIN_SIDEBAR.INSTITUTIONS.INSTITUTION_OPERATIONS',
      link: '/admin/customers',
      permit: 'GET.Reading.GetAllCustomers',
    },
  ];

  items5: SidebarItem[] = [
    {
      title: 'ADMIN_SIDEBAR.AUTHORIZATION.AUTHORIZATION_OPERATIONS',
      link: '/admin/authorization',
      permit: 'GET.Reading.GetAuthorizeDefinitionEndpoints',
    },
  ];

  items6: SidebarItem[] = [
    {
      title: 'ADMIN_SIDEBAR.CONTENTS.UPLOAD_CONTENT',
      link: '/admin/contentCreate',
      permit: 'POST.Writing.AddMainContentWithFile',
    },
    {
      title: 'ADMIN_SIDEBAR.CONTENTS.UPLOAD_COVER',
      link: '/admin/contentCover',
      permit: 'POST.Writing.AddContentCoverWithFile',
    },
    {
      title: 'ADMIN_SIDEBAR.CONTENTS.UPLOAD_SUBTITLE',
      link: '/admin/subtitle',
      permit: 'POST.Writing.AddSubtitleWithFile',
    },
    {
      title: 'ADMIN_SIDEBAR.CONTENTS.CONTENT_LIST',
      link: '/admin/contents',
      permit: 'GET.Reading.GetAllMainContentWithFile',
    },
    {
      title: 'ADMIN_SIDEBAR.CONTENTS.CONTENT_HISTORY',
      link: '/admin/contentHistory',
      permit: 'GET.Reading.GetAllContentHistoryList',
    },
    {
      title: 'ADMIN_SIDEBAR.CONTENTS.CONTENT_TAGS',
      link: '/admin/contentTag',
      permit: 'GET.Reading.GetAllContentTagList',
    },
    {
      title: 'ADMIN_SIDEBAR.CONTENTS.CONTENT_TOPICS',
      link: '/admin/contentTopic',
      permit: 'GET.Reading.GetAllContentTopicList',
    },
  ];

  items7: SidebarItem[] = [
    {
      title: 'ADMIN_SIDEBAR.TAGS.ALL_TAGS',
      link: '/admin/tags',
      permit: 'GET.Reading.GetAllTagList',
    },
  ];

  items8: SidebarItem[] = [
    {
      title: 'ADMIN_SIDEBAR.TOPICS.ALL_TOPICS',
      link: '/admin/topics',
      permit: 'GET.Reading.GetAllTopicList',
    },
  ];

  items9: SidebarItem[] = [
    {
      title: 'ADMIN_SIDEBAR.RATINGS.ALL_RATINGS',
      link: '/admin/ratings',
      permit: 'GET.Reading.GetAllRatingList',
    },
  ];

  items10: SidebarItem[] = [
    {
      title: 'ADMIN_SIDEBAR.COMMENTS.ALL_COMMENTS',
      link: '/admin/comments',
      permit: 'GET.Reading.GetAllCommentList',
    },
  ];

  items11: SidebarItem[] = [
    {
      title: 'ADMIN_SIDEBAR.NOTIFICATIONS.ALL_NOTIFICATIONS',
      link: '/admin/notification',
      permit: 'GET.Reading.GetAllNotificationList',
    },
  ];

  items12: SidebarItem[] = [
    {
      title: 'ADMIN_SIDEBAR.USER_PROFILES.ALL_PROFILES',
      link: '/admin/userProfile',
      permit: 'GET.Reading.GetAllUserProfileList',
    },
  ];

  items13: SidebarItem[] = [
    {
      title: 'ADMIN_SIDEBAR.PROGRAM_SETTINGS.SETTINGS',
      link: '/admin/programSettings',
      permit: 'GET.Reading.GetAllProgramSettingList',
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
