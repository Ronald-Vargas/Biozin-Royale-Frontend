import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { InitialsComponent } from '../shared/initials/initials.component';
import { SupportNavComponent } from '../shared/support-nav/support-nav.component';
import { TINTS } from '../shared/support.data';
import { TicketService } from 'src/app/Core/Services/ticket.service';
import { TicketResultado } from 'src/app/Core/Models/ticket.models';

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
export class UsersComponent implements OnInit {
  iconSearch = ICON_SEARCH;

  q = '';
  loading = true;

  private allUsers: SupportUser[] = [];

  constructor(private router: Router, private ticketService: TicketService) {}

  ngOnInit(): void {
    this.ticketService.listarTodos().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.allUsers = this.buildUsers(res.returnValue);
        }
      },
      error: () => { this.loading = false; },
    });
  }

  get list(): SupportUser[] {
    const query = this.q.trim().toLowerCase();
    if (!query) return this.allUsers;
    return this.allUsers.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  }

  tint(idx: number): string { return TINTS[idx % TINTS.length]; }

  goBack() { this.router.navigate(['/support']); }

  private buildUsers(tickets: TicketResultado[]): SupportUser[] {
    const seen = new Map<string, SupportUser>();
    tickets.forEach((t, i) => {
      const key = t.userEmail || t.id;
      if (!seen.has(key)) {
        seen.set(key, {
          name:    t.userDisplayName || t.userUsername || `Usuario ${i + 1}`,
          email:   t.userEmail || '—',
          tickets: 0,
          idx:     seen.size,
        });
      }
      seen.get(key)!.tickets++;
    });
    return Array.from(seen.values());
  }
}
