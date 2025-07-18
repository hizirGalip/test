import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[isPermit]',
  standalone: true
})
export class IsPermitDirective {
  private readonly permissions?: string[];
  constructor(private viewContainerRef: ViewContainerRef, private templateRef: TemplateRef<any>){
    this.permissions = JSON.parse(sessionStorage.getItem("userPermissions") ?? "['']") as string[];
  }
  @Input() set isPermit(condition: string | string[]){
    if (!condition || condition === '') {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
      return;
    }

    if (Array.isArray(condition)) {
      const hasAllPermissions = condition.every(perm => this.permissions?.includes(perm));
      if (hasAllPermissions) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainerRef.clear();
      }
      return;
    }

    // Tek bir izin kontrolü için
    if (this.permissions?.includes(condition)) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}
