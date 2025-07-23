import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UrlService } from '../../../../services/common/url.service';
import { ContentCoverWithFileListResponseDto } from '../../../../contracts/lists/content-cover-by-content-id';
import { ContentCoverService } from '../../../../services/models/content-cover.service';
import { GetAllMainContentWithFileListResponseDto } from '../../../../contracts/lists/content';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSpinnerModule],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.scss'
})
export class LessonsComponent implements OnInit {
  @Input() card!: any;
  contentCovers: { [contentId: string]: ContentCoverWithFileListResponseDto } = {};
  courses: GetAllMainContentWithFileListResponseDto[] = [];
  filteredCourses: GetAllMainContentWithFileListResponseDto[] = [];
  isLoading: boolean = false;

  constructor(
    private urlService: UrlService,
    private contentCoverService: ContentCoverService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    if (this.card?.contentId) {
      this.loadContentCover(this.card.contentId);
    }
  }

  async loadContentCover(contentId: string) {
    
    try {
      this.isLoading = true;
      const response = await this.contentCoverService.readByContentId(contentId);

      if (response?.result?.contentCoverWithFileListResponseDto?.length) {
        const cover = response.result.contentCoverWithFileListResponseDto[0];
        this.contentCovers[contentId] = cover;
      }
    } catch (error) {
      console.error(`İçerik (${contentId}) için kapak resmi çekilirken hata:`, error);
    } finally {
      this.isLoading = false;
    }
  }

  getContentImage(contentId: string): string {
    // Önce kapak resmini kontrol et
    const cover = this.contentCovers[contentId];
    if (cover?.fileOriginal) {
      return this.GetBase64Image(cover.fileOriginal);
    }

    // Kapak resmi yoksa kart üzerindeki orijinal resmi kullan
    if (this.card?.fileOriginal) {
      return this.GetBase64Image(this.card.fileOriginal);
    }

    return 'assets/images/default-course-image.jpg';
  }

  GetBase64Image(fileOriginal: string): string {
    return `data:image/jpeg;base64,${fileOriginal}`;
  }

  getQuery(id: string): string {
    return this.urlService.guidToVideoId(id);
  }
}