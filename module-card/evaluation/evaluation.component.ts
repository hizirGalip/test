import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommentsService } from '../../../../services/models/comments.service';
import { CommentListResponseDto } from '../../../../contracts/lists/comments';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ContentService } from '../../../../services/models/content.service';
import { GetAllMainContentWithFileListResponseDto } from '../../../../contracts/lists/content_single';
import { AddComment } from '../../../../contracts/requests/add-comment';
import { AlertService } from '../../../../services/alert.service';
import { UserProfileService } from '../../../../services/models/user-profile.service';
import { UserProfileResponseDto } from '../../../../contracts/lists/user-profile-by-user-id';
import { AuthService } from '../../../../services/common/auth.service';
import { UrlService } from '../../../../services/common/url.service';
import { BlackListService } from '../../../../services/common/black-list.service';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './evaluation.component.html',
  styleUrl: './evaluation.component.scss',
})
export class EvaluationComponent implements OnInit {
  comments: CommentListResponseDto[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  commentControl = new FormControl('');
  contentId: string | null = null;
  contentDetails: GetAllMainContentWithFileListResponseDto | null = null;
  currentUserId: string | null = null;
  currentUserProfile: UserProfileResponseDto | null = null;

  currentUserProfileId: string | null = null; //profile id çekmek için

  constructor(
    private commentService: CommentsService,
    private contentService: ContentService,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private userProfileService: UserProfileService,
    private authService: AuthService, // Yeni eklenen servis,
    private urlService: UrlService,
    private blackListService: BlackListService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.contentId = this.urlService.videoIdToGuid(params['contentId']);
      if (this.contentId) {
        this.getContentDetails();
        this.getComments();
        this.getCurrentUserProfile(); // Mevcut kullanıcı profilini al
      }
    });
  }

  async getCurrentUserProfile() {
    // AuthService'den güncel kullanıcı kimliğini al
    this.currentUserId = this.authService.getCurrentUserId();

    if (this.currentUserId) {
      try {
        const response = await this.userProfileService.readByUserId(
          this.currentUserId
        );

        if (response?.result?.userProfileResponseDto) {
          this.currentUserProfile = response.result.userProfileResponseDto;
        }
      } catch (error) {
        console.error('Kullanıcı profili alınırken hata oluştu', error);
        this.alertService.error('Kullanıcı profil bilgileri alınamadı');
      }
    }
  }

  @HostListener('keydown.enter', ['$event'])
  onEnterKeyPress(event: KeyboardEvent) {
    event.preventDefault(); // Enter tuşunun varsayılan davranışını engelle

    if (!event.shiftKey) {
      // Shift + Enter'la boşuk atmaya izin vermek için
      this.onCommentSubmit();
    }
  }

  async onCommentSubmit() {
    if (
      this.commentControl.value &&
      this.contentDetails?.contentId &&
      this.currentUserProfile?.profileId //Kullanıcı profili kimliği mevcut olmalı.
    ) {
      //eğer yorum küfür içeriyor ise hata mesajı verip çıkıyor
      if (this.blackListService.containsTr(this.commentControl.value)) {
        this.alertService.error('Yorumunuz küfür içermemeli.');
        return;
      }

      const newComment: AddComment = {
        contentId: this.contentDetails.contentId,
        profileId: this.currentUserProfile.profileId,
        text: this.commentControl.value,
      };
      this.getComments();
      try {
        //SuccesCallback olduktan sonra getComment list yap
        await this.commentService.create(newComment, () => {
          this.getComments();
        });
        this.commentControl.reset();
      } catch (error) {
        this.alertService.error('Yorum eklenirken hata oluştu.');
        console.error('Yorum ekleme hatası:', error);
      }
    } else {
      this.alertService.error('Yorum eklenemedi. Eksik bilgi var.');
    }
  }

  async getContentDetails() {
    try {
      this.isLoading = true;
      const response = await this.contentService.readByContentId(
        this.contentId!
      );

      if (response?.result?.getAllMainContentWithFileListResponseDto) {
        this.contentDetails =
          response.result.getAllMainContentWithFileListResponseDto || null;
      }
    } catch (error) {
      console.error('İçerik detayları alınırken hata oluştu', error);
      this.errorMessage = 'İçerik detayları yüklenirken bir hata oluştu';
    } finally {
      this.isLoading = false;
    }
  }

  async getComments() {
    try {
      this.isLoading = true;
      this.errorMessage = null;
      // ContentId ile yorumları filtreleyerek çektik
      const response = await this.commentService.readByContentId(
        this.contentId!
      );

      if (response?.result?.commentListResponseDto) {
        // Eğer response içinde commentListResponseDto varsa, bunu comments dizisine atayın
        this.comments = response.result.commentListResponseDto.filter(
          (comment: CommentListResponseDto) =>
            comment.contentId === this.contentId
        );
      }
    } catch (error) {
      this.errorMessage = 'Bu gönderiye yorum yapılmadı.';
      console.error('Yorum yükleme hatası:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onLike() {
    console.log('Beğen butonu tıklandı');
  }

  onFavorite() {
    console.log('Favori butonu tıklandı');
  }

  onDownload() {
    console.log('İndir butonu tıklandı');
  }

  onRecommend() {
    console.log('Öner butonu tıklandı');
  }
}
