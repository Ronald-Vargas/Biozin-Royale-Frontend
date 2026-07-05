import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMember } from 'src/app/Core/Models/staff.models';
import { StatusBadgeComponent } from 'src/app/Admin/shared/status-badge/status-badge.component';
import { UserAvatarComponent } from 'src/app/Admin/shared/user-avatar/user-avatar.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHEVRON_FWD } from 'src/app/User/shared/icons/icons';


@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent, UserAvatarComponent, StatusBadgeComponent],
  selector: 'app-member-row',
  templateUrl: './member-row.component.html',
  styleUrls: ['./member-row.component.scss'],
})
export class MemberRowComponent {
  @Input() member!: TeamMember;
  @Output() clicked = new EventEmitter<void>();

  iconChevron = ICON_CHEVRON_FWD;
}