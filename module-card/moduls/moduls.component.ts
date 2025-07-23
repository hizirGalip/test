import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ContentService } from '../../../../services/models/content.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GetAllMainContentWithFileListResponseDto } from '../../../../contracts/lists/content_single';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import { UrlService } from '../../../../services/common/url.service';
import { AuthService } from '../../../../services/common/auth.service';
import { ContentHistoryService } from '../../../../services/models/content-history.service';
import { UserProfileService } from '../../../../services/models/user-profile.service';
import { SubtitleService } from '../../../../services/models/subtitle.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-moduls',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSpinnerModule, TranslateModule],
  templateUrl: './moduls.component.html',
  styleUrl: './moduls.component.scss',
})
export class ModulsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef;
  private player: Player | undefined;
  private blobUrl: string | null = null;

  isLoading = false;
  errorMessage: string | null = null;
  contentId: string | null = null;
  contentDetails: GetAllMainContentWithFileListResponseDto | null = null;

  constructor(
    private contentService: ContentService,
    private route: ActivatedRoute,
    private urlService: UrlService,
    private contentHistoryService: ContentHistoryService,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private subtitleService: SubtitleService,
    private spinner: NgxSpinnerService
  ) {
    this.contentHistoryService = contentHistoryService;
    this.authService = authService;
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.contentId = this.urlService.videoIdToGuid(params['contentId']);
      if (this.contentId) {
        this.getContentDetails();
      }
    });
  }

  private async loadSubtitles(contentId: string): Promise<void> {
    try {
      const subtitleResponse = await this.subtitleService.readByContentId(
        contentId
      );
      const subtitles =
        subtitleResponse?.result?.subtitleWithFileListResponseDto;

      if (!subtitles || !this.player) return;

      // Her bir altyazı için track oluştur ve ekle
      subtitles.forEach((subtitle) => {
        const vttBlob = this.createOptimizedBlobUrl(
          subtitle.fileOriginal,
          'text/vtt'
        );

        this.player?.addRemoteTextTrack(
          {
            kind: 'subtitles',
            src: vttBlob,
            srclang: subtitle.title.toLowerCase(),
            label: subtitle.description || subtitle.title,
            default: false,
          },
          false
        );
      });
    } catch (error) {
      console.error('Altyazılar yüklenirken hata oluştu:', error);
    }
  }

  private async trackVideoProgress(progress: number) {
    try {
      const userId = this.authService.getCurrentUserId();
      if (!userId || !this.contentDetails) return;

      const userProfileResponse = await this.userProfileService.readByUserId(
        userId
      );
      if (!userProfileResponse?.result?.userProfileResponseDto) {
        console.error('Kullanıcı profili bulunamadı');
        return;
      }

      const profileId =
        userProfileResponse.result.userProfileResponseDto.profileId;

      // İçerik geçmişini kaydet
      await this.contentHistoryService.trackContentProgress(
        this.contentDetails,
        progress,
        profileId,
        this.player?.duration()
      );
    } catch (error) {
      console.error('Progress tracking error:', error);
    }
  }

  private async setupPlayerEvents() {
    if (!this.player) return;

    let lastTrackedProgress = 0;
    const progressTrackingInterval = 10; // Her 10 saniyede bir kaydet

    this.player.on('timeupdate', async () => {
      if (!this.contentDetails) return;

      const currentTime = this.player?.currentTime() || 0;
      const duration = this.player?.duration() || 0;

      if (duration > 0) {
        const currentProgress = (currentTime / duration) * 100;

        // Her 10 saniyede bir veya %5 değişiklik olduğunda kaydet
        if (
          currentTime % progressTrackingInterval === 0 ||
          Math.abs(currentProgress - lastTrackedProgress) >= 5
        ) {
          await this.trackVideoProgress(currentProgress);
          lastTrackedProgress = currentProgress;
        }
      }
    });

    // Video bittiğinde tam tamamlanma kaydını yap
    this.player.on('ended', async () => {
      await this.trackVideoProgress(100);
    });
  }

  //Kullanıcı daha önce video izlerken bıraktığı ilerlemeyi geri yükler.
  private restorePlayerState() {
    // Önceden kaydedilmiş ilerlemeyi yükle
    const savedProgressParam =
      this.route.snapshot.queryParams['resumeProgress'];
    const contentProgressFromStorage =
      this.contentHistoryService.getContentProgress(
        this.contentDetails?.contentId || ''
      );

    // Öncelikle query param'dan gelen progress'i kontrol et
    let savedProgress = savedProgressParam
      ? parseFloat(savedProgressParam)
      : null;

    // Eğer query param yoksa, storage'dan progress al
    if (!savedProgress && contentProgressFromStorage) {
      savedProgress = contentProgressFromStorage.progress;
    }

    if (savedProgress && this.player) {
      const playerDuration = this.player.duration();

      if (
        typeof playerDuration === 'number' &&
        playerDuration > 0 &&
        savedProgress > 0 &&
        savedProgress < 100
      ) {
        try {
          const seekTime = (savedProgress / 100) * playerDuration;

          // Küçük bir gecikme ekleyerek video yüklendikten sonra konumlandır
          setTimeout(() => {
            if (this.player) {
              this.player.currentTime(seekTime);
            }
          }, 500);
        } catch (error) {
          console.warn('Video konumlandırma sırasında hata:', error);
        }
      }
    }
  }

  async ngAfterViewInit() {
    if (this.contentDetails && this.videoPlayer) {
      await this.initializeVideoPlayer();
    }
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
    this.revokeBlobUrl();
  }

  private revokeBlobUrl() {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }

  async getContentDetails() {
    try {
      this.spinner.show();
      this.isLoading = true;
      const response = await this.contentService.readByContentId(
        this.contentId!
      );

      if (
        response &&
        response.result?.getAllMainContentWithFileListResponseDto
      ) {
        this.contentDetails =
          response.result.getAllMainContentWithFileListResponseDto;

        if (this.videoPlayer) {
          await this.initializeVideoPlayer();
        }
      } else {
        this.contentDetails = null;
        this.errorMessage = 'İçerik bulunamadı';
      }
    } catch (error) {
      console.error('İçerik detayları alınırken hata oluştu', error);
      this.errorMessage = 'İçerik detayları yüklenirken bir hata oluştu';
      this.contentDetails = null;
    } finally {
      this.isLoading = false;
      this.spinner.hide();
    }
  }

  private async initializeVideoPlayer() {
    this.revokeBlobUrl();
    if (this.videoPlayer && this.contentDetails?.fileFullPath) {
      try {
        if (this.player) {
          this.player.dispose();
        }

        const mimeType = this.getVideoType(this.contentDetails.fileExtension);
        this.blobUrl = this.createOptimizedBlobUrl(
          this.contentDetails.fileOriginal,
          mimeType
        );

        this.player = videojs(
          this.videoPlayer.nativeElement,
          {
            sources: [
              {
                src: this.blobUrl,
                type: mimeType,
              },
            ],
            responsive: true,
            fill: true,
            fluid: true,
            aspectRatio: '16:9',
            playbackRates: [0.5, 1, 1.5, 2],
            textTrackSettings: {
              backgroundColor: '#000',
              color: '#fff',
              fontFamily: 'Arial, sans-serif',
              fontSize: 14,
            },
            controlBar: {
              children: [
                'playToggle',
                'volumePanel',
                'currentTimeDisplay',
                'timeDivider',
                'durationDisplay',
                'progressControl',
                'remainingTimeDisplay',
                'customControlSpacer',
                'playbackRateMenuButton',
                'subsCapsButton',
                'pictureInPictureToggle',
                'fullscreenToggle',
              ],
            },
            userActions: {
              hotkeys: (event: KeyboardEvent) => {
                switch (event.key) {
                  case ' ':
                    event.preventDefault();
                    if (this.player?.paused()) {
                      this.player?.play();
                    } else {
                      this.player?.pause();
                    }
                    break;
                  case 'f':
                    event.preventDefault();
                    if (this.player) {
                      if (this.player.isFullscreen()) {
                        this.player.exitFullscreen();
                      } else {
                        this.player.requestFullscreen();
                      }
                    }
                    break;
                  case 'ArrowRight':
                    event.preventDefault();
                    if (this.player) {
                      const currentTime = this.player.currentTime();
                      if (typeof currentTime === 'number') {
                        this.player.currentTime(currentTime + 10);
                      }
                    }
                    break;
                  case 'ArrowLeft':
                    event.preventDefault();
                    if (this.player) {
                      const currentTime = this.player.currentTime();
                      if (typeof currentTime === 'number') {
                        this.player.currentTime(Math.max(0, currentTime - 10));
                      }
                    }
                    break;
                }
              },
            },
          },
          async () => {
            await this.setupPlayerEvents();
            await this.loadSubtitles(this.contentId!);
            this.restorePlayerState();
          }
        );

        this.player.on('contextmenu', (event: Event) => {
          event.preventDefault();
          return false;
        });
      } catch (error) {
        console.error('Video player başlatılamadı:', error);
        this.errorMessage = 'Video yüklenirken bir hata oluştu';
      }
    }
  }

  //10 saniye ileri sarma
  skipForward() {
    if (this.player) {
      const currentTime = this.player.currentTime();
      const duration = this.player.duration();

      if (typeof currentTime === 'number' && typeof duration === 'number') {
        this.player.currentTime(Math.min(duration, currentTime + 10));
      }
    }
  }

  //10 saniye geri sarma
  skipBackward() {
    if (this.player) {
      const currentTime = this.player.currentTime();

      if (typeof currentTime === 'number') {
        this.player.currentTime(Math.max(0, currentTime - 10));
      }
    }
  }

  //Base64 olarak alınan video verisini Blob nesnesine dönüştürür.
  private createOptimizedBlobUrl(
    base64Content: string,
    mimeType: string
  ): string {
    try {
      // More efficient Base64 to Blob conversion
      const byteCharacters = this.base64Decode(base64Content);
      const byteArray = new Uint8Array(byteCharacters);
      const blob = new Blob([byteArray], { type: mimeType });

      // Create and return blob URL
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Blob URL oluşturma hatası:', error);
      throw error;
    }
  }

  //Daha verimli Base64 çözümleme işlemi yapar.
  private base64Decode(base64: string): number[] {
    // More efficient Base64 decoding
    const base64Chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const byteCharacters: number[] = [];
    let buffer = 0;
    let bufferLength = 0;

    for (let i = 0; i < base64.length; i++) {
      if (base64[i] === '=') break;

      const charIndex = base64Chars.indexOf(base64[i]);
      if (charIndex === -1) continue;

      buffer = (buffer << 6) | charIndex;
      bufferLength += 6;

      if (bufferLength >= 8) {
        bufferLength -= 8;
        byteCharacters.push((buffer >> bufferLength) & 0xff);
      }
    }

    return byteCharacters;
  }

  //Dosya uzantısını MIME türüne dönüştürür (ör. .mp4 için video/mp4).
  public getVideoType(fileExtension: string): string {
    const extensionToMimeType: { [key: string]: string } = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      ogg: 'video/ogg',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      mkv: 'video/x-matroska',
      default: 'video/mp4',
    };

    const normalizedExtension = fileExtension.toLowerCase();
    return (
      extensionToMimeType[normalizedExtension] || extensionToMimeType['default']
    );
  }
}
