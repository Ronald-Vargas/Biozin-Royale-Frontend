import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-fin-icon',
  templateUrl: './fin-icon.component.html',
  styleUrls: ['./fin-icon.component.scss'],
})
export class FinIconComponent {
  @Input() icon = '';
  @Input() color = 'var(--gold-1)';
  @Input() bg = 'rgba(255,255,255,0.04)';
  @Input() bd = 'rgba(212,167,60,0.25)';
  @Input() size = 44;

  get wrapStyle(): { [k: string]: string } {
    return {
      width:        this.size + 'px',
      height:       this.size + 'px',
      background:   this.bg,
      'border-color': this.bd,
    };
  }

  get iconSize(): number { return Math.round(this.size * 0.46); }
}