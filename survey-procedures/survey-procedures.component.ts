import { AddSurveyQuestion } from './../../../contracts/requests/add-survey-question';
import { QuestionOptionService } from './../../../services/models/question-option.service';
import { AddQuestionAttachment } from './../../../contracts/requests/add-question-attachment';
import { AddQuestion } from './../../../contracts/requests/add-question';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AddQuestionOptionAttachment } from '../../../contracts/requests/add-question-option-attachment';
import {
  debounceTime,
  distinctUntilChanged,
  lastValueFrom,
  map,
  Subject,
} from 'rxjs';
import { QuestionOptionAttachmentService } from '../../../services/models/question-option-attachment.service';
import { QuestionAttachmentService } from '../../../services/models/question-attachment.service';
import { QuestionService } from '../../../services/models/question.service';
import { AlertService } from '../../../services/alert.service';
import { AddQuestionOption } from '../../../contracts/requests/add-question-option';
import { SurveyService } from '../../../services/models/survey.service';
import { AddSurvey } from '../../../contracts/requests/add-survey';
import { SurveyQuestionService } from '../../../services/models/survey-question.service';
import { SurveyResponseListDto } from '../../../contracts/lists/get-all-survey';
import { UpdateSurvey } from '../../../contracts/requests/update-survey';
import { UpdateQuestion } from '../../../contracts/requests/update-question';
import { UpdateQuestionOption } from '../../../contracts/requests/update-question-option';
import { DeleteQuestionOptionDialogComponent } from '../../../dialogs/delete-question-option-dialog/delete-question-option-dialog.component';
import { DeleteQuestionDialogComponent } from '../../../dialogs/delete-question-dialog/delete-question-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UpdateQuestionAttachment } from '../../../contracts/requests/update-question-attachment';
import { UpdateQuestionOptionAttachment } from '../../../contracts/requests/update-question-option-attachment';
import { DeleteSurveyDialogComponent } from '../../../dialogs/delete-survey-dialog/delete-survey-dialog.component';

interface OptionData {
  files: File[];
  filePreview: string | ArrayBuffer | null;
}

export class CustomAddQuestionDto {
  question?: AddQuestion;
  questionAttachment?: CustomQuestionAttachment;
  options?: AddQuestionOption[];
  optionAttachments?: CustomOptionAttachment[];
}
export class CustomQuestionAttachment {
  attachment?: File;
  preview?: string | ArrayBuffer | null = null;
  dto?: AddQuestionAttachment;
}
export class CustomOptionAttachment {
  attachment?: File;
  preview?: string | ArrayBuffer | null = null;
  dto?: AddQuestionOptionAttachment;
}
@Component({
  selector: 'app-survey-procedures',
  imports: [
    CommonModule,
    RouterModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslateModule,
    MatDatepickerModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    NgxDropzoneModule,
    NgxSpinnerModule,
    TranslateModule,
    MatIconModule,
    MatTooltipModule,
    // TransactionPagesComponent,
  ],
  templateUrl: './survey-procedures.component.html',
  styleUrl: './survey-procedures.component.scss',
})
export class SurveyProceduresComponent implements OnInit, OnDestroy {
  formSurvey: FormGroup;
  questions?: CustomAddQuestionDto[];
  surveys: SurveyResponseListDto[] = []; // Anket listesi
  selectedSurveyId: string = '';

  // questionForm: FormGroup;
  questionAttachmentForm: FormGroup;

  // Soru dosya yükleme için değişkenler
  questionFiles: File[] = [];
  questionFilePreview: string | ArrayBuffer | null = null;
  selectedQuestionFile: File | null = null;

  // Seçenekler için dosya yükleme değişkenleri
  optionData: OptionData[] = [];

  // İmha etme subject'i
  private destroy$ = new Subject<void>();

  // Soru ID'si (kaydedilen sorunun ID'si)
  createdQuestionId: string = '';

  // Soru tipleri - Enum formatında daha okunaklı
  readonly QUESTION_TYPES = {
    MULTIPLE_CHOICE: 1,
    SINGLE_CHOICE: 2,
    OPEN_TEXT: 3,
    YES_NO: 4,
    SCORE: 5,
    ORDER: 6,
    MATRIX: 7,
    FILE_UPLOAD: 8,
  };
  constructor(
    private formBuilder: FormBuilder,
    private questionService: QuestionService,
    private questionOptionService: QuestionOptionService,
    private questionAttachmentService: QuestionAttachmentService,
    // public dialogRef: MatDialogRef<CreateQuestionDialogComponent>,
    private questionOptionAttachmentService: QuestionOptionAttachmentService,
    private spinner: NgxSpinnerService,
    private alertService: AlertService,
    private router: Router,
    private surveyService: SurveyService,
    private surveyQuestionService: SurveyQuestionService,
    private dialog: MatDialog
  ) {
    this.questions = [
      {
        options: {
          options: {} as AddQuestionOption[],
        } as CustomAddQuestionDto,
      } as CustomAddQuestionDto,
    ];

    var data = new Object() as CustomAddQuestionDto;
    data.question = new Object() as AddQuestion;
    data.question.questionType = 1;
    data.questionAttachment = new Object() as CustomQuestionAttachment;
    data.questionAttachment.dto = new Object() as AddQuestionAttachment;
    data.options = [];
    data.options?.push(new Object() as AddQuestionOption);
    data.optionAttachments = [];
    var optionAttachment = new Object() as CustomOptionAttachment;
    optionAttachment.dto = new Object() as AddQuestionOptionAttachment;
    data.optionAttachments?.push(optionAttachment);
    this.questions = [data];
    // Ana form
    this.formSurvey = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      isActive: [true],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      maxResponses: [0],
      isAnonymous: [false],
      surveyType: [1, Validators.required],
    });

    // this.questionForm = this.formBuilder.group({
    //   questionText: ['', Validators.required],
    //   questionType: [this.QUESTION_TYPES.MULTIPLE_CHOICE, Validators.required],
    //   isRequired: [false],
    //   orderIndex: [0],
    //   isActive: [true],
    //   options: this.formBuilder.array([]),
    // });

    // Soru eki için form
    this.questionAttachmentForm = this.formBuilder.group({
      questionAttachmentTitle: [''],
      questionAttachmentDescription: [''],
      fileNameWithExtension: [''],
      fileOriginal: [''],
      isActive: [true],
    });

    // İlk seçeneği ekle
    this.addOption(0);
  }

  ngOnInit(): void {
    // Form kontrolümüzü bir değişkene atayalım
    const surveyTypeControl = this.formSurvey.get('surveyType');

    // Null kontrolü yapalım
    if (surveyTypeControl) {
      surveyTypeControl.valueChanges
        .pipe(
          // debounceTime ile hızlı değişiklikleri filtreleyebiliriz
          debounceTime(300),

          // distinctUntilChanged ile sadece değer değiştiğinde işlem yaparız
          distinctUntilChanged(),

          // Değeri sayıya dönüştürüp filtreleme işlemleri yapabiliriz
          map((value) => {
            // Önce değerin tipini kontrol edelim
            if (value === null || value === undefined) {
              return 0; // Varsayılan değer
            }

            // String mi diye kontrol edelim
            if (typeof value === 'string') {
              // Rakam dışı karakterleri temizleyebiliriz (opsiyonel)
              // const cleanedValue = value.replace(/[^0-9.-]+/g, '');
              const parsedValue = Number.parseInt(value, 10);
              return isNaN(parsedValue) ? 0 : parsedValue;
            }

            // Zaten sayı ise doğrudan döndürelim
            if (typeof value === 'number') {
              return isNaN(value) ? 0 : value;
            }

            // Diğer tüm durumlar için varsayılan değer
            return 0;
          })
        )
        .subscribe((parsedValue) => {
          // Mevcut değerle karşılaştırıp gereksiz set işlemini önleyelim
          if (surveyTypeControl.value !== parsedValue) {
            // emitEvent: false ile sonsuz döngüyü engelliyoruz
            surveyTypeControl.setValue(parsedValue, { emitEvent: false });
          }
        });
    }
    // Soru tipi değiştikçe formu güncelle
    //todo: use only this.onQuestionTypeChange(value)
    // this.questionForm
    //   .get('questionType')
    //   ?.valueChanges.pipe(takeUntil(this.destroy$))
    //   .subscribe((value) => {
    //     this.onQuestionTypeChange(value);
    //   });
    this.fetchSurveys();
  }

  fetchSurveys(): void {
    this.surveyService.read().subscribe(
      (response) => {
        if (response && response.result) {
          this.surveys = response.result.surveyResponseListDto;
        }
      },
      (error) => {
        this.alertService.error('Anketler yüklenirken bir hata oluştu.');
        console.error('Anket yükleme hatası:', error);
      }
    );
  }

  async onSurveyChange(event: any) {
    const surveyId = event.target.value;
    if (!surveyId) {
      // Yeni anket oluşturma modu
      this.resetForm();
      return;
    }

    this.selectedSurveyId = surveyId;
    this.spinner.show();

    await this.surveyService
      .readSurveyById(surveyId)
      .then(async (response) => {
        if (response && response.result) {
          const survey = response.result.surveyResponseDto;
          this.updateFormWithSurvey(survey);
          await this.loadQuestionsForSurvey(surveyId);
        }
        this.spinner.hide();
      })
      .catch((error) => {
        this.alertService.error('Anket detayları yüklenirken bir hata oluştu.');
        console.error('Anket detay hatası:', error);
        this.spinner.hide();
      });
  }

  updateFormWithSurvey(survey: any): void {
    const formatDateForInput = (dateValue: any): string => {
      if (!dateValue) return '';

      const date = new Date(dateValue);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    // Form değerlerini güncelle
    this.formSurvey.patchValue({
      title: survey.title,
      description: survey.description,
      isActive: survey.isActive,
      startDate: formatDateForInput(survey.startDate),
      endDate: formatDateForInput(survey.endDate),
      maxResponses: survey.maxResponses || 0,
      isAnonymous: survey.isAnonymous || false,
      surveyType: survey.surveyType,
    });
  }

  loadQuestionsForSurvey(surveyId: string): void {
    this.questionService.readQuestionBySurveyId(0, 100, surveyId).subscribe(
      (response) => {
        if (
          response &&
          response.result &&
          response.result.surveyQuestionResponseListDto
        ) {
          this.questions = [];

          const sortedQuestions = [
            ...response.result.surveyQuestionResponseListDto,
          ].sort((a, b) => b.orderIndex - a.orderIndex);

          sortedQuestions.forEach((item) => {
            const questionData = new Object() as CustomAddQuestionDto;
            questionData.question = {
              id: item.questionId,
              questionText: item.questionText,
              questionType: item.questionType,
              isRequired: item.isRequired,
              orderIndex: item.orderIndex,
              isActive: item.isActive,
            } as AddQuestion;

            questionData.questionAttachment =
              new Object() as CustomQuestionAttachment;
            questionData.questionAttachment.dto =
              new Object() as AddQuestionAttachment;

            // Eğer imageUrl varsa, ek dosya var demektir
            if (item.imageUrl) {
              questionData.questionAttachment.preview = item.imageUrl;
            }

            // Seçenekleri başlat - sadece boş bir dizi oluştur, yüklemeyi loadQuestionOptions yapacak
            questionData.options = [];
            questionData.optionAttachments = [];

            // Questions dizisine ekle
            this.questions?.push(questionData);
          });
        }
        this.spinner.hide();
      },
      (error) => {
        this.alertService.error('Anket soruları yüklenirken bir hata oluştu.');
        console.error('Anket soruları yükleme hatası:', error);
        this.spinner.hide();
      }
    );
  }
  // Bir sorunun seçeneklerini yükle
  loadQuestionOptions(questionIndex: number): void {
    if (
      !this.questions ||
      !this.questions[questionIndex] ||
      !this.questions[questionIndex].question ||
      !this.questions[questionIndex].question.id
    ) {
      return;
    }

    const questionId = this.questions[questionIndex].question.id;

    this.spinner.show();

    // Sorunun seçeneklerini yükle
    this.questionOptionService
      .readQuestionOptionByQuestionId(0, 100, questionId)
      .then((response) => {
        if (
          response &&
          response.result &&
          response.result.questionOptionResponseListDto
        ) {
          // Mevcut seçenekleri temizle
          this.questions![questionIndex].options = [];

          // Seçenekleri orderIndex'e göre sırala
          const sortedOptions = [
            ...response.result.questionOptionResponseListDto,
          ].sort((a, b) => a.orderIndex - b.orderIndex);

          // Seçenekleri ekle
          sortedOptions.forEach((option) => {
            const newOption = new Object() as AddQuestionOption;
            newOption.id = option.questionOptionId;
            newOption.questionId = option.questionId;
            newOption.optionText = option.optionText;
            newOption.orderIndex = option.orderIndex;
            newOption.isOther = option.isOther;
            newOption.isActive = option.isActive;
            newOption.includeAttachment = false; // Varsayılan değer, ekler yüklenince değişecek

            this.questions![questionIndex]!.options?.push(newOption);
          });

          // Seçenek eklerini yükle
          this.loadOptionAttachments(questionIndex);
        }

        // Soru için dosya eklerini de yükle
        this.loadQuestionAttachments(questionIndex);

        // Eğer hiç seçenek yüklenmediyse ve soru seçenek gerektiriyorsa, boş seçenek ekle
        if (
          (!this.questions![questionIndex].options ||
            this.questions![questionIndex].options.length === 0) &&
          this.requiresOptions(questionIndex)
        ) {
          this.setupDefaultOptions(questionIndex);
        }
      })
      .catch((error) => {
        this.alertService.error(
          'Soru seçenekleri yüklenirken bir hata oluştu.'
        );
        console.error('Soru seçenekleri hatası:', error);
        this.spinner.hide();
      });
  }

  loadQuestionAttachments(questionIndex: number): void {
    if (
      !this.questions ||
      !this.questions[questionIndex] ||
      !this.questions[questionIndex].question ||
      !this.questions[questionIndex].question.id
    ) {
      this.spinner.hide();
      return;
    }

    const questionId = this.questions[questionIndex].question.id;

    // Soru eklerini yükle
    this.questionAttachmentService.readAttachmentById(questionId).subscribe(
      (response) => {
        if (
          response &&
          response.result &&
          response.result.questionAttachmentResponseListDto &&
          response.result.questionAttachmentResponseListDto.length > 0
        ) {
          const attachment =
            response.result.questionAttachmentResponseListDto[0];

          // Soru ekini güncelle
          if (this.questions![questionIndex].questionAttachment) {
            // Base64 veriyi bir resim URL'sine dönüştür
            if (attachment.fileOriginal) {
              // Dosya tipini belirle (varsayılan olarak JPEG)
              let fileType = 'image/jpeg';
              if (attachment.fileExtension) {
                if (attachment.fileExtension.toLowerCase() === 'png') {
                  fileType = 'image/png';
                } else if (attachment.fileExtension.toLowerCase() === 'gif') {
                  fileType = 'image/gif';
                }
              }

              // Base64 verisini içeren bir URL oluştur
              const base64Data = attachment.fileOriginal;
              const imageUrl = `data:${fileType};base64,${base64Data}`;

              // Önizleme için URL'yi ayarla
              this.questions![questionIndex].questionAttachment.preview =
                imageUrl;
            } else if (attachment.fileServerPath) {
              // Eğer fileOriginal yoksa, fileServerPath kullan
              this.questions![questionIndex].questionAttachment.preview =
                attachment.fileServerPath;
            }

            // DTO bilgilerini doldur
            if (!this.questions![questionIndex].questionAttachment.dto) {
              this.questions![questionIndex].questionAttachment.dto =
                new Object() as AddQuestionAttachment;
            }

            this.questions![
              questionIndex
            ].questionAttachment.dto.questionAttachmentTitle =
              attachment.questionAttachmentTitle;
            this.questions![
              questionIndex
            ].questionAttachment.dto.fileNameWithExtension =
              attachment.fileNameWithExtension;
            this.questions![
              questionIndex
            ].questionAttachment.dto.questionAttachmentDescription =
              attachment.questionAttachmentDescription;
            this.questions![questionIndex].questionAttachment.dto.fileOriginal =
              attachment.fileOriginal;
          }
        }
        this.spinner.hide();
      },
      (error) => {
        console.error('Soru ekleri yüklenirken hata oluştu:', error);
        this.spinner.hide();
      }
    );
  }

  // Soru tipine göre varsayılan seçenekleri ayarla
  setupDefaultOptions(questionIndex: number): void {
    if (!this.questions![questionIndex]) return;

    const questionType = this.questions![questionIndex]!.question?.questionType;

    if (questionType === this.QUESTION_TYPES.YES_NO) {
      // Evet/Hayır seçeneklerini ekle
      this.setupYesNoOptions(questionIndex);
    } else {
      // Diğer soru tipleri için boş bir seçenek ekle
      this.addOption(questionIndex);
    }
  }
  resetForm(): void {
    // Formu sıfırla
    this.formSurvey.reset({
      title: '',
      description: '',
      isActive: true,
      startDate: '',
      endDate: '',
      maxResponses: 0,
      isAnonymous: false,
      surveyType: 1,
    });

    // Soruları temizle
    this.questions = [];

    // İlk boş soruyu ekle
    this.addQuestion();
  }

  ngOnDestroy(): void {
    // Abonelikleri temizle
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Soru tipi değiştiğinde çağrılacak
  onQuestionTypeChange(surveyIndex: number): void {
    // Seçenek gerektirmeyen soru tipi seçilirse seçenekleri temizle
    if (!this.requiresOptions(surveyIndex)) {
      this.clearOptions(surveyIndex);
    } else if (this.questions![surveyIndex]!.options!.length == 0) {
      // Eğer seçenek dizisi boşsa, bir tane ekle
      this.addOption(surveyIndex);

      // Evet/Hayır için otomatik seçenekler ekle
      if (
        this.questions![surveyIndex]!.question!.questionType ==
        this.QUESTION_TYPES.YES_NO
      ) {
        this.setupYesNoOptions(surveyIndex);
      }
    }
  }

  // Evet/Hayır seçeneklerini otomatik ekle
  setupYesNoOptions(surveyIndex: number): void {
    // Önce varolan seçenekleri temizle
    this.clearOptions(surveyIndex);

    // Evet seçeneği ekle
    const yesOption = this.formBuilder.group({
      optionText: ['Evet', Validators.required],
      orderIndex: [0],
      isOther: [false],
      isActive: [true],
      includeAttachment: [false],
    });
    this.questions![surveyIndex]!.options!.push(
      yesOption.value as AddQuestionOption
    );
    this.optionData.push({
      files: [],
      filePreview: null,
    });

    // Hayır seçeneği ekle
    const noOption = this.formBuilder.group({
      optionText: ['Hayır', Validators.required],
      orderIndex: [1],
      isOther: [false],
      isActive: [true],
      includeAttachment: [false],
    });
    this.questions![surveyIndex]!.options!.push(
      noOption.value as AddQuestionOption
    );
    this.optionData.push({
      files: [],
      filePreview: null,
    });
  }

  // Seçenek gerektiren soru tipleri için kontrol
  requiresOptions(questionIndex: number): boolean {
    return [
      this.QUESTION_TYPES.MULTIPLE_CHOICE,
      this.QUESTION_TYPES.SINGLE_CHOICE,
      this.QUESTION_TYPES.YES_NO,
      this.QUESTION_TYPES.SCORE,
      this.QUESTION_TYPES.ORDER,
      this.QUESTION_TYPES.MATRIX,
      this.QUESTION_TYPES.FILE_UPLOAD,
    ].includes(this.questions![questionIndex]!.question?.questionType!);
  }

  // Dosya yükleme tipi mi kontrol et
  isFileUploadType(questionType: number): boolean {
    return questionType === this.QUESTION_TYPES.FILE_UPLOAD;
  }

  // FormArray erişimi için getter
  // get optionsArray(): FormArray {
  //   return this.questionForm.get('options') as FormArray;
  // }

  // Yeni seçenek ekleme
  addOption(surveyIndex: number): void {
    const optionForm = this.formBuilder.group({
      optionText: ['', Validators.required],
      orderIndex: [this.questions![surveyIndex]!.options?.length],
      isOther: [false],
      isActive: [true],
      includeAttachment: [false],
    });

    this.questions![surveyIndex]!.options?.push(
      optionForm.value as AddQuestionOption
    );
    this.optionData.push({
      files: [],
      filePreview: null,
    });
  }

  // Tüm seçenekleri temizle
  clearOptions(surveyIndex: number): void {
    this.questions![surveyIndex]!.options = [];
    this.optionData = [];
  }

  // Soru için dosya seçme
  async onQuestionFileSelect(
    surveyIndex: number,
    event: { addedFiles: File[] }
  ): Promise<void> {
    try {
      if (!event.addedFiles || event.addedFiles.length === 0) {
        return;
      }

      this.questionFiles = [...event.addedFiles];
      const file = event.addedFiles[0];
      this.questions![surveyIndex]!.questionAttachment!.attachment = file;

      // Dosya boyutu kontrolü
      if (file.size > 10 * 1024 * 1024) {
        this.alertService.error("Dosya boyutu 10MB'dan büyük olamaz.");
        // this.onQuestionFileRemove(file);
        return;
      }
      // Base64'e çevirme
      const fileBytes = await this.convertToBase64(file);
      var dto = new Object() as AddQuestionAttachment;
      dto.fileNameWithExtension = file.name;
      dto.fileOriginal = fileBytes;
      this.questions![surveyIndex]!.questionAttachment!.dto = dto;
      // Dosya önizleme
      const reader = new FileReader();
      reader.onload = () => {
        this.questions![surveyIndex]!.questionAttachment!.preview =
          reader.result;
      };
      reader.onerror = () => {
        this.alertService.error('Dosya okunamadı.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Dosya okuma hatası:', error);
      this.alertService.error('Dosya yüklenirken bir hata oluştu.');
    }
  }

  // Soru dosyasını kaldırma
  onQuestionFileRemove(file: File): void {
    const index = this.questionFiles.indexOf(file);
    if (index !== -1) {
      this.questionFiles.splice(index, 1);
      if (this.selectedQuestionFile === file) {
        this.selectedQuestionFile = null;
        this.questionFilePreview = null;
        this.questionAttachmentForm.patchValue({
          fileNameWithExtension: '',
          fileOriginal: '',
        });
      }
    }
  }

  // Seçenek için dosya seçme
  async onOptionFileSelect(
    surveyIndex: number,
    event: { addedFiles: File[] },
    optionIndex: number
  ): Promise<void> {
    try {
      if (
        optionIndex >= this.questions![surveyIndex]!.options!.length ||
        !event.addedFiles ||
        event.addedFiles.length === 0
      ) {
        return;
      }

      const file = event.addedFiles[0];
      // Dosya boyutu kontrolü
      if (file.size > 10 * 1024 * 1024) {
        this.alertService.error("Dosya boyutu 10MB'dan büyük olamaz.");
        return;
      }

      // Sadece resim dosyalarını kabul et
      if (!file.type.startsWith('image/')) {
        this.alertService.error('Sadece resim dosyaları yükleyebilirsiniz.');
        return;
      }

      // Base64'e çevirme
      const fileBytes = await this.convertToBase64(file);
      this.optionData[optionIndex].files = [...event.addedFiles];
      var dto = new Object() as AddQuestionOptionAttachment;
      dto.questionOptionAttachmentTitle = file.name;
      dto.questionOptionAttachmentDescription = '';
      dto.fileNameWithExtension = file.name;
      dto.fileOriginal = fileBytes;
      this.questions![surveyIndex]!.optionAttachments![optionIndex].dto = dto;
      // Dosya önizleme
      const reader = new FileReader();
      reader.onload = () => {
        if (optionIndex < this.optionData.length) {
          this.questions![surveyIndex]!.optionAttachments![
            optionIndex
          ].preview = reader.result;
        }
      };
      reader.onerror = () => {
        this.alertService.error('Dosya okunamadı.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Dosya okuma hatası:', error);
      this.alertService.error('Dosya yüklenirken bir hata oluştu.');
    }
  }

  // Seçenek dosyasını kaldırma
  onOptionFileRemove(file: File, optionIndex: number): void {
    if (optionIndex >= this.optionData.length) {
      return;
    }

    const files = this.optionData[optionIndex].files;
    const index = files.indexOf(file);

    if (index !== -1) {
      files.splice(index, 1);
      this.optionData[optionIndex].filePreview = null;
    }
  }

  // Belirli bir seçeneğin dosyalarını al
  getOptionFiles(index: number): File[] {
    return index < this.optionData.length ? this.optionData[index].files : [];
  }

  // Belirli bir seçeneğin dosya önizlemesini al
  getOptionFilePreview(index: number): string | ArrayBuffer | null {
    return index < this.optionData.length
      ? this.optionData[index].filePreview
      : null;
  }

  // Formun geçerli olup olmadığını kontrol et
  isFormValid(): boolean {
    // // Temel form kontrolü
    // if (!this.questionForm.valid) {
    //   return false;
    // }

    // // Seçenek gerektiren sorular için en az bir seçenek gerekli
    // if (this.requiresOptions() && this.optionsArray.length === 0) {
    //   return false;
    // }

    // // Seçenek gerektiren sorular için tüm seçeneklerin geçerli olduğunu kontrol et
    // if (this.requiresOptions()) {
    //   for (let i = 0; i < this.optionsArray.length; i++) {
    //     const option = this.optionsArray.at(i);
    //     if (!option.valid) {
    //       return false;
    //     }

    //     // Dosya seçeneği işaretlenmişse dosya zorunlu
    //     const includeAttachment = option.get('includeAttachment')?.value;
    //     if (
    //       includeAttachment &&
    //       (i >= this.optionData.length || this.optionData[i].files.length === 0)
    //     ) {
    //       return false;
    //     }
    //   }
    // }

    return true;
  }

  // Dosyayı Base64'e çevirme
  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const base64String = btoa(
            new Uint8Array(reader.result as ArrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );
          resolve(base64String);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  // Soru dosyasının resim olup olmadığını kontrol et
  isQuestionFileImage(): boolean {
    return this.selectedQuestionFile?.type?.startsWith('image/') || false;
  }

  // Seçenek dosyasının resim olup olmadığını kontrol et
  isOptionFileImage(index: number): boolean {
    if (
      index >= this.optionData.length ||
      this.optionData[index].files.length === 0
    ) {
      return false;
    }
    return this.optionData[index].files[0].type?.startsWith('image/') || false;
  }
  // Soruyu kaydet
  private async saveQuestion(
    surveyId: string,
    questionIndex: number
  ): Promise<void> {
    const questionModel: AddQuestion = {
      questionText: this.questions![questionIndex]!.question?.questionText!,
      questionType: this.questions![questionIndex]!.question?.questionType!,
      isRequired: this.questions![questionIndex]!.question?.isRequired!,
      orderIndex: questionIndex + 1,
      isActive: this.questions![questionIndex]!.question?.isActive!,
    };

    return new Promise((resolve, reject) => {
      this.questionService.create(
        questionModel,
        async (result: any) => {
          try {
            this.questions![questionIndex]!.question!.id = result.refId;
            if (
              this.isFileUploadType(
                this.questions![questionIndex]!.question!.questionType
              )
            ) {
              await this.saveQuestionAttachment(result.refId, questionIndex);
            }
            const response = await lastValueFrom(this.questionService.read());
            const questions = response.result.questionResponseListDto;
            var dto = new Object() as AddSurveyQuestion;
            dto.isActive = true;
            dto.surveyId = surveyId;
            dto.questionId = result.refId;
            await this.surveyQuestionService.create(dto, async () => {
              if (this.requiresOptions(questionIndex)) {
                await this.saveOptions(questionIndex);
              }
            });

            // En son eklenen soruyu bulmak için questionText ve zaman damgası kullanıyoruz
            // Bu yaklaşım aynı metnin birden fazla kez kullanılması durumunda sorun yaratabilir
            // Bu nedenle backend'in yeni eklenen kayıt ID'sini döndürmesi daha güvenilir olur
            const createdQuestion = questions.find(
              (q) => q.questionText === questionModel.questionText
            );

            if (createdQuestion) {
              this.createdQuestionId = createdQuestion.questionId;
              resolve();
            } else {
              reject('Eklenen soru bulunamadı');
            }
          } catch (error) {
            reject(error);
          }
        },
        (errorMessages: string[]) => {
          reject(errorMessages);
        }
      );
    });
  }

  // Soru ekini kaydet
  private async saveQuestionAttachment(
    questionId: string,
    questionIndex: number
  ): Promise<void> {
    const requestData: AddQuestionAttachment = {
      questionId: questionId,
      questionAttachmentTitle:
        this.questions![questionIndex]!.question!.questionText || '',
      questionAttachmentDescription:
        this.questions![questionIndex]!.questionAttachment!.dto!
          .questionAttachmentDescription || '',
      fileNameWithExtension:
        this.questions![questionIndex]!.questionAttachment!.dto!
          .fileNameWithExtension,
      fileOriginal:
        this.questions![questionIndex]!.questionAttachment!.dto!.fileOriginal,
      isActive:
        this.questions![questionIndex]!.questionAttachment!.dto!.isActive,
    };
    return new Promise((resolve, reject) => {
      this.questionAttachmentService.create(
        requestData,
        () => {
          resolve();
        },
        (errors: string[]) => {
          reject(errors);
        }
      );
    });
  }

  // Seçenekleri kaydet
  private async saveOptions(questionIndex: number): Promise<void> {
    if (!this.createdQuestionId) {
      throw new Error('Soru ID bulunamadı. Seçenekler kaydedilemedi.');
    }
    var options = this.questions![questionIndex]!.options!;
    var optionAttachments = this.questions![questionIndex]!.optionAttachments!;
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const optionId = await this.saveOption(questionIndex, i);
      // 2. Seçenek için dosya varsa kaydet
      if (option.includeAttachment && optionAttachments.length > 0) {
        await this.saveOptionAttachment(questionIndex, i, optionId);
      }
    }
  }
  // Tek bir seçeneği kaydet
  private async saveOption(
    questionIndex: number,
    index: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const optionModel: AddQuestionOption = {
        questionId: this.questions![questionIndex]!.question!.id!,
        optionText: this.questions![questionIndex]!.options![index].optionText,
        orderIndex: this.questions![questionIndex]!.options![index].orderIndex,
        isOther: this.questions![questionIndex]!.options![index].isOther,
        isActive: this.questions![questionIndex]!.options![index].isActive,
      };
      this.questionOptionService.create(
        optionModel,
        async (result: any) => {
          try {
            if (result) {
              resolve(result.refId);
            } else {
              reject('Eklenen seçenek bulunamadı');
            }
          } catch (error) {
            reject(error);
          }
        },
        (errorMessages: string[]) => {
          reject(errorMessages);
        }
      );
    });
  }
  // Seçenek ekini kaydet
  private async saveOptionAttachment(
    questionIndex: number,
    optionIndex: number,
    optionId: string
  ): Promise<void> {
    if (
      optionIndex >= this.questions![questionIndex]!.options!.length ||
      this.questions![questionIndex]!.optionAttachments!.length === 0
    ) {
      return;
    }
    var dto =
      this.questions![questionIndex]!.optionAttachments![optionIndex]!.dto!;
    dto.questionOptionId = optionId;
    return new Promise((resolve, reject) => {
      this.questionOptionAttachmentService.create(
        dto,
        () => {
          resolve();
        },
        (errors: string[]) => {
          reject(errors);
        }
      );
    });
  }

  // İptal et
  onCancel(): void {
    // this.dialogRef.close();
  }

  addQuestion() {
    var data = new Object() as CustomAddQuestionDto;
    data.question = new Object() as AddQuestion;
    data.question.questionType = 1;
    data.question.orderIndex = this.questions?.length || 0 + 1;
    data.questionAttachment = new Object() as CustomQuestionAttachment;
    data.questionAttachment.dto = new Object() as AddQuestionAttachment;
    data.options = [];
    data.options?.push(new Object() as AddQuestionOption);
    data.optionAttachments = [];
    var optionAttachment = new Object() as CustomOptionAttachment;
    optionAttachment.dto = new Object() as AddQuestionOptionAttachment;
    data.optionAttachments?.push(optionAttachment);
    this.questions = [...this.questions!, data];
  }

  async save() {
    if (!this.formSurvey.valid) {
      this.alertService.error('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    this.spinner.show();

    try {
      const formValues = this.formSurvey.value;

      // Mevcut anket (güncelleme) veya yeni anket (oluşturma) kontrolü
      if (this.selectedSurveyId) {
        // Güncelleme modu
        const updateSurveyModel = {
          surveyId: this.selectedSurveyId,
          title: this.formSurvey.value.title,
          description: this.formSurvey.value.description,
          isActive: this.formSurvey.value.isActive,
          startDate: this.formSurvey.value.startDate, // Direkt Date objesi kullan
          endDate: this.formSurvey.value.endDate,
          maxResponses: this.formSurvey.value.maxResponses,
          isAnonymous: this.formSurvey.value.isAnonymous,
          surveyType: this.formSurvey.value.surveyType,
        } as UpdateSurvey;

        await this.surveyService.update(updateSurveyModel);
        // Anket başarıyla güncellendi, şimdi sorulara geçelim
        await this.updateQuestions();
        await this.updateQuestionAttachments(); // Soru resimlerini güncelle
        await this.updateQuestionOptionAttachments(); // Seçenek resimlerini güncelle

        this.alertService.success('Anket başarıyla güncellendi.');
        this.spinner.hide();
      } else {
        const createSurveyModel = {
          ...formValues,
          startDate: this.formSurvey.value.startDate,
          endDate: this.formSurvey.value.endDate,
        } as AddSurvey;
        // Yeni anket oluşturma
        this.surveyService.create(
          createSurveyModel,
          async (result: any) => {
            if (result) {
              try {
                // Yeni anket ID'si
                const newSurveyId = result.refId;

                // Tüm soruları ekle
                for (let i = 0; i < this.questions!.length; i++) {
                  await this.saveQuestion(newSurveyId, i);

                  // Eğer soru resmi varsa, kaydet
                  if (
                    this.questions![i].questionAttachment?.attachment ||
                    this.questions![i].questionAttachment?.preview
                  ) {
                    await this.updateQuestionAttachment(i);
                  }

                  // Seçenekleri ve seçenek eklerini güncelle
                  if (
                    this.questions![i].options &&
                    this.questions![i]!.options!.length > 0
                  ) {
                    for (
                      let j = 0;
                      j < this.questions![i].options!.length;
                      j++
                    ) {
                      if (this.questions![i].options![j].includeAttachment) {
                        await this.updateOptionAttachment(i, j);
                      }
                    }
                  }
                }

                this.alertService.success('Anket başarıyla oluşturuldu.');
                this.selectedSurveyId = newSurveyId; // Güncellemeleri etkinleştirmek için ID'yi sakla
              } catch (error) {
                console.error('Soru kaydetme hatası:', error);
                this.alertService.error(
                  'Sorular kaydedilirken bir hata oluştu.'
                );
              }
            }
            this.spinner.hide();
          },
          (error: any) => {
            console.error('Anket oluşturma hatası:', error);
            this.alertService.error('Anket oluşturulurken bir hata oluştu.');
            this.spinner.hide();
          }
        );
      }
    } catch (error: any) {
      console.error('İşlem hatası:', error);
      this.alertService.error('İşlem sırasında bir hata oluştu.');
      this.spinner.hide();
    }
  }

  // Tüm seçenek eklerini güncelle
  async updateQuestionOptionAttachments() {
    if (!this.questions) return;

    for (let i = 0; i < this.questions.length; i++) {
      if (
        this.questions[i].options &&
        this.questions![i]!.options!.length > 0
      ) {
        for (let j = 0; j < this.questions![i]!.options!.length; j++) {
          if (this.questions[i].options![j].includeAttachment) {
            await this.updateOptionAttachment(i, j);
          }
        }
      }
    }
  }

  // Tek bir seçeneğin ekini güncelle
  async updateOptionAttachment(questionIndex: number, optionIndex: number) {
    if (
      !this.questions ||
      !this.questions[questionIndex] ||
      !this.questions[questionIndex].options ||
      !this.questions[questionIndex].options[optionIndex] ||
      !this.questions[questionIndex].options[optionIndex].id
    ) {
      return;
    }

    const option = this.questions[questionIndex].options[optionIndex];
    const optionId = option.id;

    // Seçenek eki gerekli mi kontrol et
    if (!option.includeAttachment) return;

    try {
      // Önce mevcut ekleri kontrol et
      const attachmentResponse = await lastValueFrom(
        this.questionOptionAttachmentService.readAttachmentById(optionId!)
      );

      // Seçeneğin ekleri var mı kontrol et
      if (
        this.questions[questionIndex].optionAttachments &&
        this.questions[questionIndex].optionAttachments.length > optionIndex
      ) {
        const optionAttachment =
          this.questions[questionIndex].optionAttachments[optionIndex];

        if (
          attachmentResponse &&
          attachmentResponse.result &&
          attachmentResponse.result.questionOptionAttachmentResponseListDto &&
          attachmentResponse.result.questionOptionAttachmentResponseListDto
            .length > 0
        ) {
          // Mevcut ek var - güncelle
          const existingAttachment =
            attachmentResponse.result
              .questionOptionAttachmentResponseListDto[0];

          const updateModel: UpdateQuestionOptionAttachment = {
            questionOptionAttachmentId:
              existingAttachment.questionOptionAttachmentId,
            questionOptionId: optionId!,
            questionOptionAttachmentTitle: option.optionText || 'Seçenek Eki',
            questionOptionAttachmentDescription:
              optionAttachment.dto?.questionOptionAttachmentDescription || '',
            fileNameWithExtension: existingAttachment.fileNameWithExtension,
            fileOriginal: existingAttachment.fileOriginal,
            isActive: true,
          };

          // Yeni dosya eklenmiş mi?
          if (optionAttachment.attachment) {
            const fileBytes = await this.convertToBase64(
              optionAttachment.attachment
            );
            updateModel.fileOriginal = fileBytes;
            updateModel.fileNameWithExtension =
              optionAttachment.attachment.name;
          }

          await this.questionOptionAttachmentService.update(updateModel);
        } else if (optionAttachment.attachment) {
          // Yeni ek ekle
          const newAttachment: AddQuestionOptionAttachment = {
            questionOptionId: optionId!,
            questionOptionAttachmentTitle: option.optionText || 'Seçenek Eki',
            questionOptionAttachmentDescription:
              optionAttachment.dto?.questionOptionAttachmentDescription || '',
            fileNameWithExtension: optionAttachment.attachment.name,
            fileOriginal: await this.convertToBase64(
              optionAttachment.attachment
            ),
            isActive: true,
          };

          await new Promise<void>((resolve, reject) => {
            this.questionOptionAttachmentService.create(
              newAttachment,
              () => resolve(),
              (errors: string[]) => reject(errors)
            );
          });
        }
      }
    } catch (error) {
      console.error('Seçenek eki güncelleme hatası:', error);
      throw error;
    }
  }

  // Tüm soru eklerini güncelle
  async updateQuestionAttachments() {
    if (!this.questions) return;

    for (let i = 0; i < this.questions.length; i++) {
      await this.updateQuestionAttachment(i);
    }
  }

  // Tek bir sorunun ekini güncelle
  async updateQuestionAttachment(questionIndex: number) {
    if (
      !this.questions ||
      !this.questions[questionIndex] ||
      !this.questions[questionIndex].question ||
      !this.questions[questionIndex].question.id
    ) {
      return;
    }

    const question = this.questions[questionIndex];
    const questionId = question?.question!.id;

    // Soru eki güncellenmiş mi kontrol et
    if (
      question.questionAttachment &&
      (question.questionAttachment.attachment ||
        question.questionAttachment.preview)
    ) {
      try {
        // Önce mevcut ekleri kontrol et
        const attachmentResponse = await lastValueFrom(
          this.questionAttachmentService.readAttachmentById(questionId!)
        );

        if (
          attachmentResponse &&
          attachmentResponse.result &&
          attachmentResponse.result.questionAttachmentResponseListDto &&
          attachmentResponse.result.questionAttachmentResponseListDto.length > 0
        ) {
          // Mevcut ek var - güncelle
          const existingAttachment =
            attachmentResponse.result.questionAttachmentResponseListDto[0];

          const updateModel: UpdateQuestionAttachment = {
            questionAttachmentId: existingAttachment.questionAttachmentId,
            fileOriginal: existingAttachment.fileOriginal,
            questionId: questionId!,
            fileNameWithExtension: existingAttachment.fileNameWithExtension,
            questionAttachmentTitle:
              question.question!.questionText || 'Soru Eki',
            questionAttachmentDescription:
              question.questionAttachment.dto?.questionAttachmentDescription ||
              '',
            isActive: true,
          };

          // Yeni dosya eklenmiş mi?
          if (question.questionAttachment.attachment) {
            const fileBytes = await this.convertToBase64(
              question.questionAttachment.attachment
            );
            updateModel.fileOriginal = fileBytes;
            updateModel.fileNameWithExtension =
              question.questionAttachment.attachment.name;
          }

          await this.questionAttachmentService.update(updateModel);
        } else if (question.questionAttachment.attachment) {
          // Yeni ek ekle
          const newAttachment: AddQuestionAttachment = {
            questionId: questionId!,
            questionAttachmentTitle:
              question.question!.questionText || 'Soru Eki',
            questionAttachmentDescription:
              question.questionAttachment.dto?.questionAttachmentDescription ||
              '',
            isActive: true,
            fileNameWithExtension: question.questionAttachment.attachment.name,
            fileOriginal: await this.convertToBase64(
              question.questionAttachment.attachment
            ),
          };

          await new Promise<void>((resolve, reject) => {
            this.questionAttachmentService.create(
              newAttachment,
              () => resolve(),
              (errors: string[]) => reject(errors)
            );
          });
        }
      } catch (error) {
        console.error('Soru eki güncelleme hatası:', error);
        throw error;
      }
    }
  }

  async updateQuestions() {
    if (!this.questions || !this.selectedSurveyId) {
      return;
    }

    // Her soru için
    for (let i = 0; i < this.questions.length; i++) {
      const question = this.questions[i];

      if (question.question) {
        if (question.question.id) {
          // Mevcut soru - güncelle
          await this.updateQuestion(i);
        } else {
          // Yeni soru - ekle
          await this.saveQuestion(this.selectedSurveyId, i);
        }
      }
    }
  }
  async updateQuestion(questionIndex: number) {
    if (
      !this.questions ||
      !this.questions[questionIndex] ||
      !this.questions[questionIndex].question
    ) {
      return;
    }

    const question = this.questions[questionIndex];

    if (!question.question?.id) {
      return; // ID yoksa güncelleme yapılamaz
    }

    // Question güncelleme modeli
    const updateQuestionModel = {
      questionId: question.question.id,
      questionText: question.question.questionText,
      questionType: question.question.questionType,
      isRequired: question.question.isRequired,
      orderIndex: questionIndex + 1, // Sıralama indeksi
      isActive: question.question.isActive,
    } as UpdateQuestion;

    try {
      // Soruyu güncelle
      const result = await this.questionService.update(updateQuestionModel);

      if (result) {
        // Başarılı, şimdi seçenekleri güncelle
        await this.updateQuestionOptions(questionIndex);
      }
    } catch (error) {
      console.error('Soru güncelleme hatası:', error);
      throw error;
    }
  }

  async updateQuestionOptions(questionIndex: number) {
    if (
      !this.questions ||
      !this.questions[questionIndex] ||
      !this.questions[questionIndex].question ||
      !this.questions[questionIndex].options ||
      !this.questions[questionIndex].question.id
    ) {
      return;
    }

    const questionId = this.questions[questionIndex].question.id;
    const options = this.questions[questionIndex].options;

    // Seçenek gerektirmeyen soru tipiyse işlem yapma
    if (!this.requiresOptions(questionIndex)) {
      return;
    }

    // Her seçenek için
    for (let i = 0; i < options.length; i++) {
      const option = options[i];

      if (option.id) {
        // Mevcut seçenek - güncelle
        const updateOptionModel = {
          questionOptionId: option.id,
          questionId: questionId,
          optionText: option.optionText,
          orderIndex: i, // Sıralama indeksi
          isOther: option.isOther,
          isActive: option.isActive,
        } as UpdateQuestionOption;

        await this.questionOptionService.update(updateOptionModel);
      } else {
        // Yeni seçenek - ekle
        option.questionId = questionId;
        option.orderIndex = i;
        await this.saveOption(questionIndex, i);
      }
    }
  }
  // Form gönderildiğinde
  async onSubmit(): Promise<void> {
    // if (!this.isFormValid()) {
    //   this.alertService.error('Lütfen tüm gerekli alanları doldurun.');
    //   return;
    // }
    // this.spinner.show();
    // try {
    //   // 1. Önce soruyu kaydet
    //   await this.saveQuestion();
    //   // 2. Soru dosyası varsa ekle
    //   if (this.isFileUploadType() && this.questionFiles.length > 0) {
    //     await this.saveQuestionAttachment();
    //   }
    //   // 3. Seçenekleri kaydet
    //   if (this.requiresOptions()) {
    //     await this.saveOptions();
    //   }
    //   // this.dialogRef.close(true);
    //   this.alertService.success('Soru ve seçenekler başarıyla kaydedildi.');
    //   this.router.navigate(['/questions']); // İşlem tamamlandıktan sonra sorular sayfasına yönlendir
    // } catch (error) {
    //   console.error('Kayıt sırasında hata oluştu:', error);
    //   this.alertService.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    // } finally {
    //   this.spinner.hide();
    // }
  }

  deleteQuestion(questionIndex: number): void {
    if (!this.questions || !this.questions[questionIndex]) {
      return;
    }

    const question = this.questions[questionIndex];
    var confirmed = false;
    // Eğer sorunun ID'si varsa (veritabanında kayıtlı)
    if (question?.question?.id) {
      // Kullanıcıya onay sor
      const dialogRef = this.dialog.open(DeleteQuestionDialogComponent, {
        width: '400px',
        data: { questionId: question.question.id },
      });

      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.spinner.show();

          this.questionService
            .regularDelete(question.question?.id!)
            .then((result) => {
              this.questions?.splice(questionIndex, 1);
              this.alertService.success('Soru başarıyla silindi.');
            })
            .catch((error) => {
              console.error('Soru silme hatası:', error);
              this.alertService.error('Soru silinirken bir hata oluştu.');
            })
            .finally(() => {
              this.spinner.hide();
            });
        }
      });
    } else this.questions!.splice(questionIndex, 1);
  }

  // Seçenek silme
  removeOption(surveyIndex: number, index: number): void {
    const option = this.questions![surveyIndex]!.options![index];

    // Eğer seçeneğin ID'si varsa (veritabanında kayıtlı)
    if (option?.id) {
      const dialogRef = this.dialog.open(DeleteQuestionOptionDialogComponent, {
        width: '400px',
        data: { questionOptionId: option.id },
      });

      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.spinner.show();

          this.questionOptionService
            .regularDelete(option?.id!)
            .then((result) => {
              this.questions![surveyIndex]!.options?.splice(index, 1);
              if (this.optionData.length > index) {
                this.optionData.splice(index, 1);
                this.alertService.success('Seçenek başarıyla silindi.');
              }
            })
            .catch((error) => {
              console.error('Seçenek silme hatası:', error);
              this.alertService.error('Seçenek silinirken bir hata oluştu.');
            })
            .finally(() => {
              this.spinner.hide();
            });
        }
      });
    } else {
      this.questions![surveyIndex]!.options?.splice(index, 1);
      if (this.optionData.length > index) {
        this.optionData.splice(index, 1);
      }
    }
  }

  // deleteQuestion(questionIndex: number): void {
  //   if (!this.questions || !this.questions[questionIndex]) {
  //     return;
  //   }

  //   const question = this.questions[questionIndex];

  //   // Eğer sorunun ID'si varsa (veritabanında kayıtlı)
  //   if (question.question && question.question.id) {
  //     // Kullanıcıya onay sor
  //     if (!confirm('Bu soruyu silmek istediğinize emin misiniz?')) {
  //       return;
  //     }

  //     this.spinner.show();

  //     // Soruyu sil
  //     this.questionService
  //       .regularDelete(question.question.id)
  //       .then((result) => {
  //         if (result) {
  //           // Başarılı - UI'dan soruyu kaldır
  //           this.questions?.splice(questionIndex, 1);
  //           this.alertService.success('Soru başarıyla silindi.');
  //         }
  //       })
  //       .catch((error) => {
  //         console.error('Soru silme hatası:', error);
  //         this.alertService.error('Soru silinirken bir hata oluştu.');
  //       })
  //       .finally(() => {
  //         this.spinner.hide();
  //       });
  //   }
  //   // Henüz kaydedilmemiş - direkt UI'dan kaldır
  //   this.questions.splice(questionIndex, 1);
  // }

  // // Seçenek silme
  // removeOption(surveyIndex: number, index: number): void {
  //   // if (!this.questions || !this.questions || this.questions.length <= 1) {
  //   //   this.alertService.info('En az bir seçenek bulunmalıdır.');
  //   //   return;
  //   // }
  //   const option = this.questions![surveyIndex]!.options![index];
  //   // Eğer seçeneğin ID'si varsa (veritabanında kayıtlı)
  //   if (option.id) {
  //     // Kullanıcıya onay sor
  //     if (!confirm('Bu seçeneği silmek istediğinize emin misiniz?')) {
  //       return;
  //     }

  //     this.spinner.show();

  //     // Seçeneği sil
  //     this.questionOptionService
  //       .regularDelete(option.id)
  //       .then((result) => {
  //         if (result) {
  //           // Başarılı - UI'dan seçeneği kaldır
  //           this.questions![surveyIndex]!.options?.splice(index, 1);
  //           if (this.optionData.length > index) {
  //             this.optionData.splice(index, 1);
  //           }
  //           this.alertService.success('Seçenek başarıyla silindi.');
  //         }
  //       })
  //       .catch((error) => {
  //         console.error('Seçenek silme hatası:', error);
  //         this.alertService.error('Seçenek silinirken bir hata oluştu.');
  //       })
  //       .finally(() => {
  //         this.spinner.hide();
  //       });
  //   }
  //   // Henüz kaydedilmemiş - direkt UI'dan kaldır
  //   this.questions![surveyIndex]!.options?.splice(index, 1);
  //   if (this.optionData.length > index) {
  //     this.optionData.splice(index, 1);
  //   }

  //   // Kalan seçeneklerin sıra numaralarını güncelle
  //   // for (let i = 0; i < this.questions![surveyIndex]!.options!.length; i++) {
  //   //   this.questions[surveyIndex].options![i].orderIndex = i;
  //   // }
  // }

  loadOptionAttachments(questionIndex: number): void {
    if (
      !this.questions ||
      !this.questions[questionIndex] ||
      !this.questions[questionIndex].options
    ) {
      return;
    }

    const options = this.questions[questionIndex].options;

    // Her seçenek için ekleri yükle
    for (let i = 0; i < options.length; i++) {
      const option = options[i];

      if (option.id) {
        // Bu seçeneğin eklerini yükle
        this.loadSingleOptionAttachment(questionIndex, i, option.id);
      }
    }
  }

  loadSingleOptionAttachment(
    questionIndex: number,
    optionIndex: number,
    optionId: string
  ): void {
    this.questionOptionAttachmentService.readAttachmentById(optionId).subscribe(
      (response) => {
        if (
          response &&
          response.result &&
          response.result.questionOptionAttachmentResponseListDto &&
          response.result.questionOptionAttachmentResponseListDto.length > 0
        ) {
          const attachment =
            response.result.questionOptionAttachmentResponseListDto[0];

          // Seçenek için ek varsa
          if (!this.questions![questionIndex].optionAttachments) {
            this.questions![questionIndex].optionAttachments = [];
          }

          // optionAttachments dizisinin uzunluğunu kontrol et
          while (
            this.questions![questionIndex].optionAttachments.length <=
            optionIndex
          ) {
            const newAttachment = new Object() as CustomOptionAttachment;
            newAttachment.dto = new Object() as AddQuestionOptionAttachment;
            this.questions![questionIndex].optionAttachments.push(
              newAttachment
            );
          }

          // Base64 veriyi bir resim URL'sine dönüştür
          if (attachment.fileOriginal) {
            // Dosya tipini belirle
            let fileType = 'image/jpeg';
            if (attachment.fileExtension) {
              if (attachment.fileExtension.toLowerCase() === 'png') {
                fileType = 'image/png';
              } else if (attachment.fileExtension.toLowerCase() === 'gif') {
                fileType = 'image/gif';
              }
            }

            // Base64 verisini içeren bir URL oluştur
            const base64Data = attachment.fileOriginal;
            const imageUrl = `data:${fileType};base64,${base64Data}`;

            // Seçeneğin includeAttachment özelliğini true olarak işaretle
            this.questions![questionIndex]!.options![
              optionIndex!
            ]!.includeAttachment! = true;

            // Önizleme için URL'yi ayarla
            this.questions![questionIndex]!.optionAttachments![
              optionIndex!
            ]!.preview! = imageUrl;

            // DTO bilgilerini doldur
            this.questions![questionIndex]!.optionAttachments![
              optionIndex!
            ]!.dto!.questionOptionId = optionId;
            this.questions![questionIndex]!.optionAttachments![
              optionIndex!
            ]!.dto!.questionOptionAttachmentTitle =
              attachment.questionOptionAttachmentTitle;
            this.questions![questionIndex]!.optionAttachments![
              optionIndex!
            ]!.dto!.questionOptionAttachmentDescription =
              attachment.questionOptionAttachmentDescription;
            this.questions![questionIndex]!.optionAttachments![
              optionIndex!
            ]!.dto!.fileNameWithExtension = attachment.fileNameWithExtension;
            this.questions![questionIndex]!.optionAttachments![
              optionIndex!
            ]!.dto!.fileOriginal = attachment.fileOriginal;

            // optionData ve filePreview'ı güncelle
            if (this.optionData.length <= optionIndex) {
              // optionData dizisini genişlet
              while (this.optionData.length <= optionIndex) {
                this.optionData.push({
                  files: [],
                  filePreview: null,
                });
              }
            }

            this.optionData[optionIndex].filePreview = imageUrl;
          }
        }
      },
      (error) => {
        console.error(
          `Seçenek ${optionIndex} ekleri yüklenirken hata oluştu:`,
          error
        );
      }
    );
  }

  removeSurvey() {
    const dialogRef = this.dialog.open(DeleteSurveyDialogComponent, {
      width: '400px',
      data: { surveyId: this.selectedSurveyId },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        window.location.reload();
      }
    });
  }
}
