import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';

export interface SecLine {
  label:       string;
  value?:      string;
  valueColor?: string;
  strong?:     boolean;
  dot?:        boolean;
  color?:      string;
}

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-sec-card',
  templateUrl: './sec-card.component.html',
  styleUrls: ['./sec-card.component.scss'],
})
export class SecCardComponent {
  @Input() icon       = '';        
  @Input() iconText   = '';       
  @Input() title      = '';
  @Input() lines: SecLine[] = [];
  @Input() btnIcon    = '';
  @Input() btnLabel   = '';

  @Output() btnClick = new EventEmitter<void>();

  lineColor(l: SecLine): string {
    if (l.strong) return 'var(--cream)';
    return l.color || '#cbb98f';
  }
}