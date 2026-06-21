import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-initials',
  templateUrl: './initials.component.html',
  styleUrls: ['./initials.component.scss'],
})
export class InitialsComponent {
  @Input() text = '';
  @Input() size = 46;
  @Input() tint = '#caa';

  get initials(): string {
    return this.text.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  get wrapStyle(): { [k: string]: string } {
    return {
      width:        this.size + 'px',
      height:       this.size + 'px',
      background:   `radial-gradient(circle at 50% 32%, ${this.tint}, #2a2418)`,
    };
  }

  get fontSize(): string { return (this.size * 0.34) + 'px'; }
}