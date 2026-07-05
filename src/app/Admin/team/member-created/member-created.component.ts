import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHECK, ICON_SPARKLES, ICON_PEOPLE, ICON_ADD, ICON_PERSON_OUTLINE, ICON_MAIL, ICON_AT, ICON_SHIELD } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { TeamMember } from 'src/app/Core/Models/staff.models';

interface CreatedRow {
  icon:  string;
  label: string;
  value: string;
  isStatus?: boolean;
}

@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent,
  ],
  selector: 'app-member-created',
  templateUrl: './member-created.component.html',
  styleUrls: ['./member-created.component.scss'],
})
export class MemberCreatedComponent implements OnInit {
  iconCheck    = ICON_CHECK;
  iconSparkles = ICON_SPARKLES;
  iconPeople   = ICON_PEOPLE;
  iconAdd      = ICON_ADD;

  member: TeamMember = {
    id: '',
    name: 'Andrea Salazar',
    email: 'andrea.salazar@biozinroyale.com',
    user: 'andrea.salazar',
    role: 'Soporte',
    status: 'Activo',
    sendCreds: true,
  };

  rows: CreatedRow[] = [];
  logo = 'assets/logo.png';

  constructor(private router: Router) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state || history.state;
    if (state && state.member) this.member = state.member;

    this.rows = [
      { icon: ICON_PERSON_OUTLINE, label: 'Nombre completo',   value: this.member.name },
      { icon: ICON_MAIL,           label: 'Correo electrónico', value: this.member.email },
      { icon: ICON_AT,             label: 'Usuario',            value: this.member.user || '' },
      { icon: ICON_SHIELD,         label: 'Rol',                value: this.member.role },
    ];
  }

  get sendsCreds(): boolean { return this.member.sendCreds !== false; }

  get subtitle(): string {
    return this.sendsCreds
      ? 'Las credenciales fueron enviadas por correo electrónico.'
      : 'El miembro ya puede iniciar sesión con sus credenciales.';
  }

  get statusText(): string {
    return this.sendsCreds ? 'Credenciales enviadas' : 'Cuenta activa';
  }

  goTeam()      { this.router.navigate(['/admin/equipo']); }
  goNewMember() { this.router.navigate(['/admin/equipo/nuevo']); }
}