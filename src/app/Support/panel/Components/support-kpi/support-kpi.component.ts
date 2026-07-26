import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportKpi } from 'src/app/Core/Models/ticket.models';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-support-kpi',
  templateUrl: './support-kpi.component.html',
  styleUrls: ['./support-kpi.component.scss'],
})
export class SupportKpiComponent {
  @Input() kpi!: SupportKpi;
}