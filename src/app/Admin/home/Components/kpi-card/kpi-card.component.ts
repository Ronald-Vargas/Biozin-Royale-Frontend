import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminKpi } from 'src/app/Core/Models/admin.models';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss'],
})
export class KpiCardComponent {
  @Input() kpi!: AdminKpi;
}