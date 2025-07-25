import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CreateCenterComponent } from '../create-center/create-center.component';
import {
  CenterResponseListDto,
  GetAllCenterResponse,
} from '../../../../contracts/lists/get-all-center';
import { CenterService } from '../../../../services/models/center.service';
import { DeleteCenterDialogComponent } from '../../../../dialogs/delete-center-dialog/delete-center-dialog.component';
import { UpdateCenterDialogComponent } from '../../../../dialogs/update-center-dialog/update-center-dialog.component';
import { IsPermitDirective } from '../../../../directives/common/is-permit.directive';
import { IsPermitService } from '../../../../services/common/is-permit.service';
import { DeletePermit } from '../../../../abstracts/permit/delete-permit';
import { UpdatePermit } from '../../../../abstracts/permit/update-permit';

@Component({
  selector: 'app-tab1',
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTooltipModule,
    TranslateModule,
    NgxSpinnerModule,
    CreateCenterComponent,
    IsPermitDirective
  ],
  templateUrl: './tab1.component.html',
  styleUrl: './tab1.component.scss',
})
export class Tab1Component implements DeletePermit, UpdatePermit {
  displayedColumns: string[] = [
    'centerName',
    'centerType',
    'regularDelete',
    'update',
  ];
  dataSource = new MatTableDataSource<CenterResponseListDto>();
  isLoading = false;
  errorMessage: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private centerService: CenterService,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private permitService: IsPermitService
  ) {}
  updatePermit: string = 'PUT.Updating.UpdateCenter';
  deletePermit: string = 'DELETE.Deleting.RegularDeleteCenter';

  ngOnInit() {
    this.getCenters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onAddCenter() {
    this.getCenters();
  }

  async getCenters() {
    await this.spinner.show();
    this.isLoading = true;
    this.errorMessage = null;
    this.centerService.read().subscribe({
      next: async (response: GetAllCenterResponse) => {
        if (
          response &&
          response.result &&
          response.result.centerResponseListDto
        ) {
          this.dataSource.data = response.result.centerResponseListDto;
        }
        this.isLoading = false;
        await this.spinner.hide();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Veri çekilirken bir hata oluştu';
        console.error('Veri çekilirken bir hata oluştu:', error);
      },
    });
  }

  DeleteCenter(centerId: string) {
    this.permitService.isPermit(this.deletePermit, () => {
      const dialogRef = this.dialog.open(DeleteCenterDialogComponent, {
        width: '500px',
        data: { centerId: centerId },
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getCenters();
      });
    });
  }

  UpdateCenter(center: CenterResponseListDto) {
    this.permitService.isPermit(this.updatePermit, () => {
      const dialogRef = this.dialog.open(UpdateCenterDialogComponent, {
        width: '500px',
        data: {
          centerId: center.centerId,
          centerName: center.centerName,
          centerType: center.centerType,
          isActive: center.isActive,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getCenters();
      });
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
