import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_ADD } from 'src/app/User/shared/icons/icons';


@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-pay-section',
  templateUrl: './pay-section.component.html',
  styleUrls: ['./pay-section.component.scss'],
})
export class PaySectionComponent {
  @Input() icon     = '';
  @Input() title    = '';
  @Input() addLabel = '';

  iconAdd = ICON_ADD;
}