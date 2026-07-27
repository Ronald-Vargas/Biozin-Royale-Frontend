import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_TRASH } from 'src/app/User/shared/icons/icons';
import { ProfileService } from 'src/app/Core/Services/profile.service';
import { SessionRow, mapSession } from '../active-sessions.util';

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent],
  selector: 'app-active-sessions',
  templateUrl: './active-sessions.component.html',
  styleUrls: ['./active-sessions.component.scss'],
})
export class ActiveSessionsComponent implements OnInit {
  iconTrash = ICON_TRASH;

  loading = true;
  sessions: SessionRow[] = [];

  constructor(
    private router: Router,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  private loadSessions(): void {
    this.profileService.getSessions().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError || !res.returnValue) return;
        this.sessions = res.returnValue.map(mapSession);
      },
      error: () => { this.loading = false; },
    });
  }

  closeSession(id: string): void {
    this.profileService.closeSession(id).subscribe({
      next: (res) => { if (!res.blnError) this.loadSessions(); },
      error: () => {},
    });
  }

  closeAll(): void {
    this.profileService.closeOtherSessions().subscribe({
      next: (res) => { if (!res.blnError) this.loadSessions(); },
      error: () => {},
    });
  }

  goBack(): void { this.router.navigate(['/seguridad']); }
}
