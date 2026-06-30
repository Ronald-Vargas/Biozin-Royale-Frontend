import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH, ICON_FUNNEL, ICON_ADD_CIRCLE } from 'src/app/User/shared/icons/icons';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { TeamMember } from '../shared/admin.data';
import { MemberRowComponent } from './Components/member-row/member-row.component';
import { StaffService } from 'src/app/Core/Services/staff.service';
import { PerfilResultado } from 'src/app/Core/Models/profile.models';

export function toTeamMember(perfil: PerfilResultado): TeamMember {
  return {
    name: perfil.displayName ?? perfil.username,
    role: perfil.role === 'admin' ? 'Administrador' : 'Soporte',
    status: perfil.status === 'active' ? 'Activo' : 'Inactivo',
    email: perfil.email,
    phone: perfil.phone ?? undefined,
  };
}

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
export class TeamComponent implements OnInit {
  iconSearch    = ICON_SEARCH;
  iconFunnel    = ICON_FUNNEL;
  iconAddCircle = ICON_ADD_CIRCLE;

  q = '';
  members: TeamMember[] = [];

  constructor(private router: Router, private staffService: StaffService) {}

  ngOnInit() {
    this.staffService.list().subscribe((res) => {
      if (!res.blnError && res.returnValue) {
        this.members = res.returnValue.map(toTeamMember);
      }
    });
  }

  get total(): number { return this.members.length; }

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
