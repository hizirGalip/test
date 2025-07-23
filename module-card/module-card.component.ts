import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LessonsComponent } from './lessons/lessons.component';
import { ModulsComponent } from './moduls/moduls.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { ContentService } from '../../../services/models/content.service';
import { UrlService } from '../../../services/common/url.service';
import { GetAllMainContentWithFileListResponseDto } from '../../../contracts/lists/content_single';

@Component({
  selector: 'app-module-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LessonsComponent,
    ModulsComponent,
    EvaluationComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './module-card.component.html',
  styleUrl: './module-card.component.scss',
})
export class ModuleCardComponent implements OnInit {
  isLoading = false;
  errorMessage: string | null = null;
  contents: any[] = [];

  constructor(
    private contentService: ContentService,
    private urlService: UrlService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.getContents();
  }

  async getContents() {
    try {
      const response = await this.contentService.read();
      if (response?.result?.getAllMainContentWithFileListResponseDto) {
        this.contents =
          response.result.getAllMainContentWithFileListResponseDto;
      }
    } catch (error) {
      console.error('İçerikler yüklenirken hata oluştu:', error);
    }
  }

  navigateToModuleCard(content: GetAllMainContentWithFileListResponseDto) {
    this.router.navigate(['/moduleCard'], {
      queryParams: {
        contentId: this.urlService.guidToVideoId(content.contentId),
      },
    });
  }
}
