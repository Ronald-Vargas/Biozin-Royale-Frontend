import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { AtmosphereComponent } from '../atmosphere/atmosphere.component';
import { SvgIconComponent }    from '../svg-icons/svg-icon.component';
import { BottomNavComponent }  from '../../../home/components/bottom-nav/bottom-nav.component';
import { ICON_ARROW_BACK } from '../../icons/icons';

@Component({
  standalone: true,
  imports: [CommonModule, IonContent, AtmosphereComponent, SvgIconComponent, BottomNavComponent],
  selector: 'app-screen-shell',
  templateUrl: './screen-shell.component.html',
  styleUrls: ['./screen-shell.component.scss'],
})
export class ScreenShellComponent {
  @Input() title    = '';
  @Input() current  = '';
  @Input() glow     = 0.26;
  @Input() showNav  = true;

  @Output() back    = new EventEmitter<void>();
  @Output() navClick = new EventEmitter<string>();

  iconBack = ICON_ARROW_BACK;
}