import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';

export interface ASupKpi {
  label: string;
  value: number | string;
  icon:  string;
  tint:  string;
  bg:    string;
  sub?:  string;
}

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-asup-kpi',
  templateUrl: './asup-kpi.component.html',
  styleUrls: ['./asup-kpi.component.scss'],
})
export class ASupKpiComponent {
  @Input() kpi!: ASupKpi;
}