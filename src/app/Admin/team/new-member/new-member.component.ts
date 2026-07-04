import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_PERSON_OUTLINE, ICON_MAIL, ICON_PHONE_CALL, ICON_SHIELD, ICON_PERSON_ADD, ICON_SPARKLES } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { TeamMember } from 'src/app/Core/Models/staff.models';
import { FormFieldComponent } from './Components/form-field/form-field.component';
import { SelectFieldComponent } from './Components/select-field/select-field.component';
import { StaffService } from 'src/app/Core/Services/staff.service';
import { toTeamMember } from '../team.component';

const ROLE_TO_BACKEND: Record<string, 'admin' | 'soporte'> = {
  Administrador: 'admin',
  Soporte: 'soporte',
};

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

  name  = '';
  email = '';
  phone = '';
  role  = 'Soporte';

  roleOptions = ['Administrador', 'Soporte'];

  constructor(private router: Router, private staffService: StaffService) {}

  goBack() { this.router.navigate(['/admin/equipo']); }

  submit() {
    this.staffService.create({
      nombre: this.name,
      correoContacto: this.email,
      phone: this.phone,
      role: ROLE_TO_BACKEND[this.role],
    }).subscribe((res) => {
      if (res.blnError || !res.returnValue) return;

      const member: TeamMember = {
        ...toTeamMember(res.returnValue),
        user: res.returnValue.username,
        pass: res.returnValue.tempPassword ?? undefined,
        sendCreds: true,
      };
      this.router.navigate(['/admin/equipo/creado'], { state: { member } });
    });
  }
}
