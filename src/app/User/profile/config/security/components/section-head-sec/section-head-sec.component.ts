import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHEVRON_FWD } from 'src/app/User/shared/icons/icons';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-section-head-sec',
  templateUrl: './section-head-sec.component.html',
  styleUrls: ['./section-head-sec.component.scss'],
})
export class SectionHeadSecComponent {
  @Input() title  = '';
  @Input() action = '';
  @Output() actionClick = new EventEmitter<void>();

  iconChevron = ICON_CHEVRON_FWD;
}