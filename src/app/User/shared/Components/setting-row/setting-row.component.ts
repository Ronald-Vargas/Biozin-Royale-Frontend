import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICON_CHEVRON_FWD } from '../../icons/icons';
import { SvgIconComponent } from '../svg-icons/svg-icons.component';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-setting-row',
  templateUrl: './setting-row.component.html',
  styleUrls: ['./setting-row.component.scss'],
})
export class SettingRowComponent {
  @Input() icon  = '';
  @Input() label = '';
  @Input() value = '';
  @Input() last  = false;
  @Input() showChevron = true;
  @Output() rowClick = new EventEmitter<void>();

  iconChevron = ICON_CHEVRON_FWD;
}