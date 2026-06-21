import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { GoldButtonComponent } from '../../shared/Components/gold-button/gold-button.component';
import { GhostButtonComponent } from '../../shared/Components/ghost-button/ghost-button.component';
import { FieldComponent } from 'src/app/Auth/Components/field/field.component';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { EstadisticasResultado, PerfilResultado } from 'src/app/Core/Models/auth.models';
import { ICON_PERSON_CIRCLE, ICON_FINGERPRINT, ICON_COPY, ICON_CHECK, ICON_CALENDAR, ICON_CAMERA, ICON_EDIT, ICON_STATS, ICON_PERSON_OUTLINE, ICON_MAIL, ICON_AT, ICON_GLOBE, ICON_PHONE_CALL, ICON_ALBUMS, ICON_TROPHY, ICON_CASH, ICON_TRENDING } from '../../shared/icons/icons';

interface InfoRow { k: string; v: string; icon: string; }
interface Stat    { icon: string; value: string; label: string; }

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ScreenShellComponent,
    SvgIconComponent,
    GoldButtonComponent,
    GhostButtonComponent,
    FieldComponent,
  ],
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss'],
})
export class PersonalInformationComponent implements OnInit {
  copied = false;
  editMode = false;
  loading = false;
  saving = false;
  errorMsg = '';

  iconPersonCircle = ICON_PERSON_CIRCLE;
  iconFinger       = ICON_FINGERPRINT;
  iconCopy         = ICON_COPY;
  iconCheck        = ICON_CHECK;
  iconCalendar     = ICON_CALENDAR;
  iconCamera       = ICON_CAMERA;
  iconEdit         = ICON_EDIT;
  iconStats        = ICON_STATS;

  perfil: PerfilResultado | null = null;

  info: InfoRow[] = [];

  stats: Stat[] = [];

  form: FormGroup;

  constructor(private router: Router, private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      displayName: [''],
      username: [''],
      phone: [''],
      country: [''],
      birthdate: [''],
    });
  }

  get displayNameCtrl() { return this.form.get('displayName') as FormControl; }
  get usernameCtrl()    { return this.form.get('username')    as FormControl; }
  get phoneCtrl()       { return this.form.get('phone')       as FormControl; }
  get countryCtrl()     { return this.form.get('country')     as FormControl; }
  get birthdateCtrl()   { return this.form.get('birthdate')   as FormControl; }

  ngOnInit(): void {
    this.loading = true;
    this.authService.getProfile().subscribe({
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

    this.authService.getStatistics().subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) this.aplicarEstadisticas(res.returnValue);
      },
    });
  }

  goBack() { this.router.navigate(['/perfil']); }

  copyId() {
    try {
      if (navigator.clipboard && this.perfil) navigator.clipboard.writeText(this.perfil.id);
    } catch {}
    this.copied = true;
    setTimeout(() => this.copied = false, 1400);
  }

  editInfo() {
    if (!this.perfil) return;
    this.form.setValue({
      displayName: this.perfil.displayName ?? '',
      username: this.perfil.username ?? '',
      phone: this.perfil.phone ?? '',
      country: this.perfil.country ?? '',
      birthdate: this.perfil.birthdate ?? '',
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

    this.authService.updateProfile(this.form.value).subscribe({
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

  private aplicarPerfil(perfil: PerfilResultado): void {
    this.perfil = perfil;
    this.info = [
      { k: 'Nombre completo',     v: perfil.displayName || '—',        icon: ICON_PERSON_OUTLINE },
      { k: 'Correo electrónico',  v: perfil.email,                     icon: ICON_MAIL },
      { k: 'Usuario',             v: '@' + perfil.username,            icon: ICON_AT },
      { k: 'País',                v: perfil.country || 'Sin definir',  icon: ICON_GLOBE },
      { k: 'Fecha de nacimiento', v: perfil.birthdate || 'Sin definir', icon: ICON_CALENDAR },
      { k: 'Teléfono',            v: perfil.phone || 'Sin definir',    icon: ICON_PHONE_CALL },
    ];
  }

  private aplicarEstadisticas(stats: EstadisticasResultado): void {
    this.stats = [
      { icon: ICON_ALBUMS,   value: stats.partidasJugadas.toLocaleString('en-US'),               label: 'Partidas\njugadas' },
      { icon: ICON_TROPHY,   value: stats.partidasGanadas.toLocaleString('en-US'),                label: 'Partidas\nganadas' },
      { icon: ICON_CASH,     value: '$' + stats.apostadoTotal.toLocaleString('en-US'),             label: 'Apostado\ntotal' },
      { icon: ICON_TRENDING, value: '$' + stats.gananciasNetas.toLocaleString('en-US'),            label: 'Ganancias\nnetas' },
    ];
  }
}