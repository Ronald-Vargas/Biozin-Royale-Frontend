import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { StaffService } from 'src/app/Core/Services/staff.service';
import { HistEntry, mapSecurityEvent } from 'src/app/User/profile/config/security/security-history.util';

@Component({
  standalone: true,
  imports: [CommonModule, AtmosphereComponent, SvgIconComponent, AdminHeaderComponent, AdminNavComponent],
  selector: 'app-admin-security-history',
  templateUrl: './security-history.component.html',
  styleUrls: ['./security-history.component.scss'],
})
export class AdminSecurityHistoryComponent implements OnInit {
  loading = true;
  history: HistEntry[] = [];

  constructor(
    private router: Router,
    private staffService: StaffService,
  ) {}

  ngOnInit(): void {
    this.staffService.getSecurityHistory().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError || !res.returnValue) return;
        this.history = res.returnValue.map(mapSecurityEvent);
      },
      error: () => { this.loading = false; },
    });
  }

  goBack(): void { this.router.navigate(['/admin/seguridad']); }
}
