import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { SupportNavComponent } from '../../shared/support-nav/support-nav.component';
import { ICON_TRASH } from 'src/app/User/shared/icons/icons';
import { StaffService } from 'src/app/Core/Services/staff.service';
import { SessionRow, mapSession } from 'src/app/User/profile/config/security/active-sessions.util';

@Component({
  standalone: true,
  imports: [CommonModule, AtmosphereComponent, SvgIconComponent, AdminHeaderComponent, SupportNavComponent],
  selector: 'app-support-active-sessions',
  templateUrl: './active-sessions.component.html',
  styleUrls: ['./active-sessions.component.scss'],
})
export class SupportActiveSessionsComponent implements OnInit {
  iconTrash = ICON_TRASH;

  loading = true;
  sessions: SessionRow[] = [];

  constructor(
    private router: Router,
    private staffService: StaffService,
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  private loadSessions(): void {
    this.staffService.getSessions().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError || !res.returnValue) return;
        this.sessions = res.returnValue.map(mapSession);
      },
      error: () => { this.loading = false; },
    });
  }

  closeSession(id: string): void {
    this.staffService.closeSession(id).subscribe({
      next: (res) => { if (!res.blnError) this.loadSessions(); },
      error: () => {},
    });
  }

  closeAll(): void {
    this.staffService.closeOtherSessions().subscribe({
      next: (res) => { if (!res.blnError) this.loadSessions(); },
      error: () => {},
    });
  }

  goBack(): void { this.router.navigate(['/soporte/seguridad']); }
}
