import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICON_FACEBOOK, ICON_MAIL } from '../../icons/icons';
import { SvgIconComponent } from '../svg-icons/svg-icons.component';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-social-row',
  templateUrl: './social-row.component.html',
  styleUrls: ['./social-row.component.scss'],
})
export class SocialRowComponent {
  @Output() picked = new EventEmitter<string>();

  iconFacebook = ICON_FACEBOOK;
}