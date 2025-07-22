import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { SurveyResponseComponent } from '../../survey-response/survey-response.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-transaction-pages',
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    // QuestionComponent,
    // QuestionOptionComponent,
    // SurveyComponent,
    // SurveyAttachmentComponent,
    SurveyResponseComponent,
    // SurveyUserComponent,
    // SurveyQuestionComponent,
    TranslateModule,
    // QuestionAttachmentListComponent,
    // QuestionOptionAttachmentListComponent,
  ],
  templateUrl: './transaction-pages.component.html',
  styleUrl: './transaction-pages.component.scss',
})
export class TransactionPagesComponent {
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  selectedTabIndex = 0;

  nextTab() {
    if (this.selectedTabIndex < this.tabGroup._tabs.length - 1) {
      this.selectedTabIndex++;
      this.tabGroup.selectedIndex = this.selectedTabIndex;
    }
  }

  previousTab() {
    if (this.selectedTabIndex > 0) {
      this.selectedTabIndex--;
      this.tabGroup.selectedIndex = this.selectedTabIndex;
    }
  }
}
