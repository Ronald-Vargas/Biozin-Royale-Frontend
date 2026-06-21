import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-meta-chip',
  templateUrl: './meta-chip.component.html',
  styleUrls: ['./meta-chip.component.scss'],
})
export class MetaChipComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() dot = '';
  @Input() value = '';
  @Input() clickable = false;
  @Output() chipClick = new EventEmitter<void>();

  onClick() {
    if (this.clickable) this.chipClick.emit();
  }
}