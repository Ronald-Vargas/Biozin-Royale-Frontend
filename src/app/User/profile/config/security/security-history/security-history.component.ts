import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ProfileService } from 'src/app/Core/Services/profile.service';
import { HistEntry, mapSecurityEvent } from '../security-history.util';

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent],
  selector: 'app-security-history',
  templateUrl: './security-history.component.html',
  styleUrls: ['./security-history.component.scss'],
})
export class SecurityHistoryComponent implements OnInit {
  loading = true;
  history: HistEntry[] = [];

  constructor(
    private router: Router,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.profileService.getSecurityHistory().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError || !res.returnValue) return;
        this.history = res.returnValue.map(mapSecurityEvent);
      },
      error: () => { this.loading = false; },
    });
  }

  goBack(): void { this.router.navigate(['/seguridad']); }
}
