import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_ARROW_BACK, ICON_FILTER } from 'src/app/User/shared/icons/icons';
@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
})
export class AdminHeaderComponent {
  @Input() title = '';
  @Input() showFilter = false;
  @Output() back   = new EventEmitter<void>();
  @Output() filter = new EventEmitter<void>();

  iconBack   = ICON_ARROW_BACK;
  iconFilter = ICON_FILTER;
}