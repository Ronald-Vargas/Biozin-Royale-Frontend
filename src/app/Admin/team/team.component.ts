import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH, ICON_FUNNEL, ICON_ADD_CIRCLE } from 'src/app/User/shared/icons/icons';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { TeamMember, TEAM_MEMBERS } from '../shared/admin.data';
import { MemberRowComponent } from './Components/member-row/member-row.component';


@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent, MemberRowComponent,
  ],
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent {
  iconSearch    = ICON_SEARCH;
  iconFunnel    = ICON_FUNNEL;
  iconAddCircle = ICON_ADD_CIRCLE;

  q = '';
  members: TeamMember[] = TEAM_MEMBERS;

  constructor(private router: Router) {}

  get total(): number { return TEAM_MEMBERS.length; }

  get list(): TeamMember[] {
    const query = this.q.trim().toLowerCase();
    if (!query) return this.members;
    return this.members.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query)
    );
  }

  goBack()      { this.router.navigate(['/admin/usuarios']); }
  goNewMember() { this.router.navigate(['/admin/equipo/nuevo']); }
}