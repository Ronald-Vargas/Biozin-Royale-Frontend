import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BONO_KIND, BonoKindStyle } from '../../../shared/admin.data';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-kind-badge',
  templateUrl: './kind-badge.component.html',
  styleUrls: ['./kind-badge.component.scss'],
})
export class KindBadgeComponent {
  @Input() kind = 'Liquidez';

  get style(): BonoKindStyle {
    return BONO_KIND[this.kind] || BONO_KIND['Liquidez'];
  }
}