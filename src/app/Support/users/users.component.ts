import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { InitialsComponent } from '../shared/initials/initials.component';
import { SupportNavComponent } from '../shared/support-nav/support-nav.component';
import { SUPPORT_TICKETS, TINTS } from '../shared/support.data';


interface SupportUser {
  name:    string;
  email:   string;
  tickets: number;
  idx:     number;
}

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    SupportNavComponent, AdminHeaderComponent, InitialsComponent,
  ],
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  iconSearch = ICON_SEARCH;
  q = '';

  constructor(private router: Router) {}

  get users(): SupportUser[] {
    const seen: Record<string, boolean> = {};
    const result: SupportUser[] = [];
    SUPPORT_TICKETS.forEach((t, i) => {
      if (!seen[t.email]) {
        seen[t.email] = true;
        result.push({
          name:    t.name,
          email:   t.email,
          tickets: SUPPORT_TICKETS.filter(x => x.email === t.email).length,
          idx:     i,
        });
      }
    });
    return result;
  }

  get list(): SupportUser[] {
    const query = this.q.trim().toLowerCase();
    if (!query) return this.users;
    return this.users.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  }

  tint(idx: number): string { return TINTS[idx % TINTS.length]; }

  goBack() { this.router.navigate(['/soporte']); }
}