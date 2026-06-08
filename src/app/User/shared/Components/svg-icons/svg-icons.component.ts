import { Component, Input, OnChanges, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-icon',
  template: `<span class="svg-icon" [innerHTML]="safeHtml"></span>`,
  styles: [`
    .svg-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .svg-icon ::ng-deep svg {
      width: var(--icon-size, 20px);
      height: var(--icon-size, 20px);
      display: block;
    }
  `]
})
export class SvgIconComponent implements OnChanges {
  @Input() svg  = '';
  @Input() size = 20;
  safeHtml!: SafeHtml;

  constructor(private sanitizer: DomSanitizer, private el: ElementRef) {}

  ngOnChanges(): void {
    this.el.nativeElement.style.setProperty('--icon-size', this.size + 'px');
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.svg);
  }
}