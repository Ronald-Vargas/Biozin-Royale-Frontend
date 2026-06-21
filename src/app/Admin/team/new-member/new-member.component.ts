import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_PERSON_OUTLINE, ICON_MAIL, ICON_PHONE_CALL, ICON_SHIELD, ICON_PERSON_ADD, ICON_SPARKLES } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { TeamMember, autoUsername, autoPassword, ACCESS_BY_ROLE, TEAM_MEMBERS } from '../../shared/admin.data';
import { FormFieldComponent } from './Components/form-field/form-field.component';
import { SelectFieldComponent } from './Components/select-field/select-field.component';

@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent,
    FormFieldComponent, SelectFieldComponent,
  ],
  selector: 'app-new-member',
  templateUrl: './new-member.component.html',
  styleUrls: ['./new-member.component.scss'],
})
export class NewMemberComponent {
  iconPerson    = ICON_PERSON_OUTLINE;
  iconMail      = ICON_MAIL;
  iconPhone     = ICON_PHONE_CALL;
  iconShield    = ICON_SHIELD;
  iconSparkles  = ICON_SPARKLES;
  iconPersonAdd = ICON_PERSON_ADD;

  name  = 'Andrea Salazar';
  email = 'andrea.salazar@biozinroyale.com';
  phone = '+52 55 9876 5432';
  role  = 'Soporte';

  roleOptions = ['Administrador', 'Soporte'];

  constructor(private router: Router) {}

  goBack() { this.router.navigate(['/admin/equipo']); }

  submit() {
    const member: TeamMember = {
      name:      this.name,
      email:     this.email,
      phone:     this.phone,
      role:      this.role,
      status:    'Activo',
      user:      autoUsername(this.name),
      pass:      autoPassword(),
      access:    ACCESS_BY_ROLE[this.role],
      sendCreds: true,
    };
    TEAM_MEMBERS.unshift(member);
    this.router.navigate(['/admin/equipo/creado'], { state: { member } });
  }
}