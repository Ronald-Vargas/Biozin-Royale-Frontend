import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icons/svg-icon.component';
import { ICON_APPLE, ICON_MAIL } from '../../icons/icons';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-social-row',
  templateUrl: './social-row.component.html',
  styleUrls: ['./social-row.component.scss'],
})
export class SocialRowComponent {
  @Output() picked = new EventEmitter<string>();

  iconApple = ICON_APPLE;
  iconMail  = ICON_MAIL;
}