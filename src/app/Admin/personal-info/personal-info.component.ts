import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { FieldComponent } from 'src/app/Auth/Components/field/field.component';
import { StaffService } from 'src/app/Core/Services/staff.service';
import { PerfilResultado } from 'src/app/Core/Models/profile.models';
import {
  ICON_SHIELD, ICON_PERSON_OUTLINE, ICON_MAIL, ICON_AT,
  ICON_PHONE_CALL, ICON_EDIT, ICON_CHECK, ICON_COPY,
} from 'src/app/User/shared/icons/icons';

interface InfoRow { k: string; v: string; icon: string; editable?: boolean; }

@Component({
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    AtmosphereComponent, SvgIconComponent,
    AdminHeaderComponent, AdminNavComponent,
    FieldComponent,
  ],
  selector: 'app-admin-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss'],
})
export class AdminPersonalInfoComponent implements OnInit {
  iconShield  = ICON_SHIELD;
  iconEdit    = ICON_EDIT;
  iconCheck   = ICON_CHECK;
  iconCopy    = ICON_COPY;

  perfil: PerfilResultado | null = null;
  loading  = true;
  saving   = false;
  editMode = false;
  errorMsg = '';
  copied   = false;

  info: InfoRow[] = [];

  form: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private staffService: StaffService,
  ) {
    this.form = this.fb.group({
      displayName: [''],
      phone: [''],
    });
  }

  get displayNameCtrl() { return this.form.get('displayName') as FormControl; }
  get phoneCtrl()       { return this.form.get('phone')       as FormControl; }

  ngOnInit(): void {
    this.staffService.getMe().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError || !res.returnValue) {
          this.errorMsg = res.strResponseMessage || 'No se pudo cargar el perfil.';
          return;
        }
        this.aplicarPerfil(res.returnValue);
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'No se pudo conectar con el servidor.';
      },
    });
  }

  goBack() {
    const ruta = this.perfil?.role === 'soporte' ? '/soporte/ajustes' : '/admin/ajustes';
    this.router.navigate([ruta]);
  }

  copyUsername() {
    try {
      if (navigator.clipboard && this.perfil) {
        navigator.clipboard.writeText(this.perfil.username);
      }
    } catch {}
    this.copied = true;
    setTimeout(() => this.copied = false, 1400);
  }

  editInfo() {
    if (!this.perfil) return;
    this.form.setValue({
      displayName: this.perfil.displayName ?? '',
      phone: this.perfil.phone ?? '',
    });
    this.errorMsg = '';
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
    this.errorMsg = '';
  }

  saveInfo() {
    if (this.saving) return;
    this.saving = true;
    this.errorMsg = '';

    const datos: Record<string, string> = {};
    for (const [campo, valor] of Object.entries(this.form.value)) {
      if (valor) datos[campo] = valor as string;
    }

    this.staffService.updateMe(datos).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.blnError || !res.returnValue) {
          this.errorMsg = res.strResponseMessage || 'No se pudo actualizar el perfil.';
          return;
        }
        this.aplicarPerfil(res.returnValue);
        this.editMode = false;
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'No se pudo conectar con el servidor.';
      },
    });
  }

  get roleLabel(): string {
    return this.perfil?.role === 'admin' ? 'Administrador' : 'Soporte';
  }

  get roleBg(): string {
    return this.perfil?.role === 'admin'
      ? 'rgba(199, 154, 50, 0.18)'
      : 'rgba(63, 130, 220, 0.18)';
  }

  get roleColor(): string {
    return this.perfil?.role === 'admin' ? 'var(--gold-1)' : '#7eb8f7';
  }

  private aplicarPerfil(perfil: PerfilResultado): void {
    this.perfil = perfil;
    this.info = [
      { k: 'Nombre completo',      v: perfil.displayName || '—',       icon: ICON_PERSON_OUTLINE, editable: true },
      { k: 'Correo institucional', v: perfil.email,                    icon: ICON_MAIL },
      { k: 'Usuario',              v: '@' + perfil.username,           icon: ICON_AT },
      { k: 'Teléfono',             v: perfil.phone || 'Sin definir',   icon: ICON_PHONE_CALL,     editable: true },
    ];
  }
}
