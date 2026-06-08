import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../shared/components/svg-icons/svg-icon.component';
import { ICON_CHEVRON_FWD } from '../../../shared/icons/icons';

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

  iconChevron = ICON_CHEVRON_FWD;
}