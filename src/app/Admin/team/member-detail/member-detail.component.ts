import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { FieldComponent } from 'src/app/Auth/Components/field/field.component';
import { StaffService } from 'src/app/Core/Services/staff.service';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { PerfilResultado } from 'src/app/Core/Models/profile.models';
import {
  ICON_SHIELD, ICON_PERSON_OUTLINE, ICON_MAIL, ICON_AT,
  ICON_PHONE_CALL, ICON_EDIT, ICON_CHECK, ICON_COPY,
  ICON_CALENDAR, ICON_POWER, ICON_TRASH, ICON_KEY,
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
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss'],
})
export class MemberDetailComponent implements OnInit {
  iconShield   = ICON_SHIELD;
  iconEdit     = ICON_EDIT;
  iconCheck    = ICON_CHECK;
  iconCopy     = ICON_COPY;
  iconPower    = ICON_POWER;
  iconTrash    = ICON_TRASH;
  iconKey      = ICON_KEY;
  iconCalendar = ICON_CALENDAR;

  perfil: PerfilResultado | null = null;
  loading   = true;
  saving    = false;
  editMode  = false;
  errorMsg  = '';
  copied    = false;

  showDeleteConfirm = false;
  deleting  = false;
  toggling  = false;

  info: InfoRow[] = [];
  form: FormGroup;

  private memberId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private staffService: StaffService,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({ displayName: [''], phone: [''] });
  }

  get displayNameCtrl() { return this.form.get('displayName') as FormControl; }
  get phoneCtrl()       { return this.form.get('phone')       as FormControl; }

  get isSelf(): boolean {
    return this.authService.currentProfile()?.id === this.memberId;
  }

  get isActive(): boolean { return this.perfil?.status === 'active'; }

  get roleLabel(): string {
    return this.perfil?.role === 'admin' ? 'Administrador' : 'Soporte';
  }

  get roleBg(): string {
    return this.perfil?.role === 'admin'
      ? 'rgba(199, 154, 50, 0.18)' : 'rgba(63, 130, 220, 0.18)';
  }

  get roleColor(): string {
    return this.perfil?.role === 'admin' ? 'var(--gold-1)' : '#7eb8f7';
  }

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadMember();
  }

  goBack() { this.router.navigate(['/admin/equipo']); }

  copyUsername() {
    if (navigator.clipboard && this.perfil) {
      navigator.clipboard.writeText(this.perfil.username).catch(() => {});
    }
    this.copied = true;
    setTimeout(() => this.copied = false, 1400);
  }

  editInfo() {
    if (!this.perfil) return;
    this.form.setValue({ displayName: this.perfil.displayName ?? '', phone: this.perfil.phone ?? '' });
    this.errorMsg = '';
    this.editMode = true;
  }

  cancelEdit() { this.editMode = false; this.errorMsg = ''; }

  saveInfo() {
    if (this.saving) return;
    this.saving = true;
    this.errorMsg = '';

    const datos: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.form.value)) {
      if (v) datos[k] = v as string;
    }

    this.staffService.updateById(this.memberId, datos).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.blnError || !res.returnValue) {
          this.errorMsg = res.strResponseMessage || 'No se pudo actualizar.';
          return;
        }
        this.aplicarPerfil(res.returnValue);
        this.editMode = false;
      },
      error: () => { this.saving = false; this.errorMsg = 'Error de conexión.'; },
    });
  }

  toggleStatus() {
    if (!this.perfil || this.toggling) return;
    this.toggling = true;
    const nuevoStatus = this.isActive ? 'inactive' : 'active';

    this.staffService.changeStatus(this.memberId, nuevoStatus).subscribe({
      next: (res) => {
        this.toggling = false;
        if (!res.blnError && res.returnValue) this.aplicarPerfil(res.returnValue);
      },
      error: () => { this.toggling = false; },
    });
  }

  requestDelete() { this.showDeleteConfirm = true; }
  cancelDelete()  { this.showDeleteConfirm = false; }

  confirmDelete() {
    if (this.deleting) return;
    this.deleting = true;

    this.staffService.deleteById(this.memberId).subscribe({
      next: (res) => {
        this.deleting = false;
        if (!res.blnError) this.router.navigate(['/admin/equipo']);
        else this.showDeleteConfirm = false;
      },
      error: () => { this.deleting = false; this.showDeleteConfirm = false; },
    });
  }

  resetPassword() {
    // UI-only — sin funcionalidad por ahora
  }

  private loadMember() {
    this.staffService.getById(this.memberId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError || !res.returnValue) {
          this.errorMsg = res.strResponseMessage || 'No se pudo cargar el miembro.';
          return;
        }
        this.aplicarPerfil(res.returnValue);
      },
      error: () => { this.loading = false; this.errorMsg = 'Error de conexión.'; },
    });
  }

  private aplicarPerfil(perfil: PerfilResultado): void {
    this.perfil = perfil;
    const fechaCreacion = perfil.createdAt
      ? new Date(perfil.createdAt).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })
      : '—';

    this.info = [
      { k: 'Nombre completo',      v: perfil.displayName || '—',          icon: ICON_PERSON_OUTLINE, editable: true },
      { k: 'Correo institucional', v: perfil.email,                        icon: ICON_MAIL },
      { k: 'Usuario',              v: '@' + perfil.username,               icon: ICON_AT },
      { k: 'Teléfono',             v: perfil.phone || 'Sin definir',       icon: ICON_PHONE_CALL, editable: true },
      { k: 'Miembro desde',        v: fechaCreacion,                       icon: ICON_CALENDAR },
      { k: 'Creado por',           v: perfil.createdByName || '—',         icon: ICON_SHIELD },
    ];
  }
}
