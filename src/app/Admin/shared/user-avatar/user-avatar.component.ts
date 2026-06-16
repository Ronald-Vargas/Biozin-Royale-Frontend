import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_PERSON } from 'src/app/User/shared/icons/icons';


@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
})
export class UserAvatarComponent {
  @Input() size = 50;

  iconPerson = ICON_PERSON;

  get wrapStyle(): { [k: string]: string } {
    return { width: this.size + 'px', height: this.size + 'px' };
  }

  get iconSize(): number { return Math.round(this.size * 0.52); }
}