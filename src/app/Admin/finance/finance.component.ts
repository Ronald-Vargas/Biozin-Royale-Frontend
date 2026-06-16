import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH, ICON_FUNNEL, ICON_CHEVRON_FWD } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { FinSummary, FIN_SUMMARY, FinRecent, FIN_RECENT } from '../shared/admin.data';
import { FinIconComponent } from './Components/fin-icon/fin-icon.component';

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent, FinIconComponent,
  ],
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss'],
})



export class AdminFinanceComponent {
  iconSearch  = ICON_SEARCH;
  iconFunnel  = ICON_FUNNEL;
  iconChevron = ICON_CHEVRON_FWD;

  q = '';
  summary: FinSummary[] = FIN_SUMMARY;
  recent:  FinRecent[]  = FIN_RECENT;

  constructor(private router: Router) {}

  goBack() { this.router.navigate(['/admin']); }
}