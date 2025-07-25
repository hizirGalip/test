import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CreateCenterDialogComponent } from '../../../../dialogs/create-center-dialog/create-center-dialog.component';
import { IsPermitService } from '../../../../services/common/is-permit.service';
import { CreatePermit } from '../../../../abstracts/permit/create-permit';
import { IsPermitDirective } from '../../../../directives/common/is-permit.directive';

@Component({
  selector: 'app-create-center',
  imports: [CommonModule, RouterModule, MatTooltipModule, TranslateModule, IsPermitDirective],
  templateUrl: './create-center.component.html',
  styleUrl: './create-center.component.scss'
})
export class CreateCenterComponent implements CreatePermit{
  @Output() centerAdded = new EventEmitter<void>();
  createPermit: string = "POST.Writing.AddCenter";

  constructor(private dialog: MatDialog,
    private permitService: IsPermitService
  ) {}

  openCreateDialog() {
    this.permitService.isPermit(this.createPermit, () => {
    const dialogRef = this.dialog.open(CreateCenterDialogComponent, {
      width: '700px',
      disableClose: true //Diyalog açıkken, kullanıcı diyalog dışında bir yere tıklayarak kapatamaz.
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.centerAdded.emit();
      }
    });
  })
  }
}
