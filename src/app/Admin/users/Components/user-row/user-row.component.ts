import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar.component';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { AdminUser } from 'src/app/Core/Models/profile.models';
import { ICON_CHEVRON_FWD } from 'src/app/User/shared/icons/icons';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent, UserAvatarComponent, StatusBadgeComponent],
  selector: 'app-user-row',
  templateUrl: './user-row.component.html',
  styleUrls: ['./user-row.component.scss'],
})
export class UserRowComponent {
  @Input() user!: AdminUser;
  @Output() open = new EventEmitter<string>();

  iconChevron = ICON_CHEVRON_FWD;
}