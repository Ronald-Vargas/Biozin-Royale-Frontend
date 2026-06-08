import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { SvgIconComponent } from '../../../shared/components/svg-icons/svg-icon.component';
import { ICON_BACK } from '../../../shared/icons/icons';

@Component({
  standalone: true,
  imports: [CommonModule, LogoComponent, SvgIconComponent],
  selector: 'app-auth-header',
  templateUrl: './auth-header.component.html',
  styleUrls: ['./auth-header.component.scss'],
})
export class AuthHeaderComponent {
  @Input() title    = '';
  @Input() subtitle = '';
  @Input() logoSize = 70;
  @Output() backClick = new EventEmitter<void>();

  iconBack = ICON_BACK;
}