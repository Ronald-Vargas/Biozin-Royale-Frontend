import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_PERSON } from 'src/app/User/shared/icons/icons';
import { nameInitial, nameColor } from 'src/app/Core/Utils/avatar.utils';


@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
})
export class UserAvatarComponent {
  @Input() size = 50;
  @Input() name = '';
  @Input() avatarUrl: string | null | undefined;

  iconPerson = ICON_PERSON;

  get wrapStyle(): { [k: string]: string } {
    return { width: this.size + 'px', height: this.size + 'px' };
  }

  get iconSize():    number { return Math.round(this.size * 0.52); }
  get initialSize(): number { return Math.round(this.size * 0.44); }
  get initial():     string { return nameInitial(this.name); }
  get initBg():      string { return nameColor(this.name); }
}