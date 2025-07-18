import { Component, Input, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { GetAllCategoryService } from '../../../../services/models/get-all-category.service';
import { CategoryWithSubCategoriesDto } from '../../../../contracts/lists/get-all-category';
import { UrlService } from '../../../../services/common/url.service';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { filter } from 'rxjs';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
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
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  @Input() drawer!: MatDrawer;
  selectedItem: number | string | null = null;
  selectedSection: string | null = null;
  categories: CategoryWithSubCategoriesDto[] = [];

  // Toggle state'leri için yeni property
  expandedCategories: Set<string> = new Set();

  isSidebarOpen = false;

  constructor(
    private categoryService: GetAllCategoryService,
    private urlService: UrlService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.setActiveItemFromUrl();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setActiveItemFromUrl();
      });
  }

  async loadCategories() {
    try {
      const response = await this.categoryService.readAll(0, 100);
      if (response && response.result) {
        this.categories = response.result.categoryWithSubCategoriesDto;
        setTimeout(() => this.setActiveItemFromUrl(), 100);
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata oluştu:', error);
    }
  }

  setActiveItemFromUrl() {
    const currentUrl = this.router.url;

    if (currentUrl === '/home' || currentUrl === '/') {
      this.selectedSection = 'home';
      this.selectedItem = 0;
    } else if (currentUrl.includes('/category')) {
      const urlParams = new URLSearchParams(currentUrl.split('?')[1]);
      const categoryId = urlParams.get('id');

      if (categoryId) {
        const realCategoryId = this.urlService.videoIdToGuid(categoryId);

        // Ana kategorilerde ara
        for (const category of this.categories) {
          if (category.categoryId === realCategoryId) {
            this.selectedSection = 'category';
            this.selectedItem = category.categoryId;
            return;
          }

          // Alt kategorilerde ara
          if (category.subCategories) {
            for (const subCategory of category.subCategories) {
              if (subCategory.categoryId === realCategoryId) {
                this.selectedSection = 'category';
                this.selectedItem = subCategory.categoryId;
                // Alt kategori seçiliyse ana kategoriyi aç
                this.expandedCategories.add(category.categoryId);
                return;
              }
            }
          }
        }
      }
    }
  }

  selectItem(section: string, index: number | string) {
    this.selectedItem = typeof index === 'string' ? index : index;
    this.selectedSection = section;
  }

  isSelected(section: string, index: number | string): boolean {
    return this.selectedSection === section && this.selectedItem === index;
  }

  // Yeni toggle metodu
  toggleCategory(categoryId: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  // Kategori açık mı kontrol et
  isCategoryExpanded(categoryId: string): boolean {
    return this.expandedCategories.has(categoryId);
  }

  // Ana kategori tıklandığında hem toggle hem de seçim
  onCategoryClick(category: CategoryWithSubCategoriesDto, event: Event) {
    if (category.subCategories && category.subCategories.length > 0) {
      // Alt kategorisi varsa toggle yap
      this.toggleCategory(category.categoryId, event);
    } else {
      // Alt kategorisi yoksa normal seçim yap
      this.selectItem('category', category.categoryId);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  idToUrlQuery(id: string) {
    return this.urlService.guidToVideoId(id);
  }
}
