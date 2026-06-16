import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepKpi } from '../../../shared/admin.data';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-rep-kpi',
  templateUrl: './rep-kpi.component.html',
  styleUrls: ['./rep-kpi.component.scss'],
})
export class RepKpiComponent {
  @Input() kpi!: RepKpi;
}