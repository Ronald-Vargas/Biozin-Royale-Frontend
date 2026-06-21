import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ToggleComponent } from 'src/app/User/shared/Components/toggle/toggle.component';
import { ICON_CHECK_CIRCLE, ICON_GIFT_FILLED, ICON_CASH, ICON_SYNC_CIRCLE } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { BONO_KIND, AdminBono, ADMIN_BONOS } from '../../shared/admin.data';


const LIQ_PRESETS  = ['100% hasta $500', '50% hasta $200', '$25 gratis', '500,000 Fichas'];
const SPIN_PRESETS = [10, 25, 50, 100];
const DAYS_PRESETS = [3, 5, 7, 15, 30];

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent, ToggleComponent,
  ],
  selector: 'app-new-bonuse',
  templateUrl: './new-bonuse.component.html',
  styleUrls: ['./new-bonuse.component.scss'],
})
export class NewBonuseComponent {
  iconCheck   = ICON_CHECK_CIRCLE;
  iconGift    = ICON_GIFT_FILLED;

  kind: 'Liquidez' | 'Tiradas' = 'Liquidez';
  title  = '';
  liq    = '100% hasta $500';
  spins  = 50;
  days   = 7;
  noReq  = true;
  enabled = true;

  liqPresets  = LIQ_PRESETS;
  spinPresets = SPIN_PRESETS;
  daysPresets = DAYS_PRESETS;

  readonly kindOptions: Array<'Liquidez' | 'Tiradas'> = ['Liquidez', 'Tiradas'];

  constructor(private router: Router) {}

  get valid(): boolean { return this.title.trim().length >= 3; }

  kindStyle(k: string) { return BONO_KIND[k] || BONO_KIND['Liquidez']; }
  isKind(k: string): boolean { return this.kind === k; }

  get previewDesc(): string {
    return this.kind === 'Liquidez' ? this.liq : `${this.spins} Giros Gratis`;
  }

  get previewReq(): string {
    return this.noReq ? 'Sin requisitos' : 'Requisito de apuesta: 20x';
  }

  get previewIcon(): string {
    return this.kind === 'Liquidez' ? ICON_CASH : ICON_SYNC_CIRCLE;
  }

  submit() {
    if (!this.valid) return;
    const b: AdminBono = {
      id:      'b' + Date.now(),
      title:   this.title.trim(),
      kind:    this.kind,
      icon:    this.kind === 'Liquidez' ? ICON_CASH : ICON_SYNC_CIRCLE,
      desc:    this.previewDesc,
      req:     this.previewReq,
      time:    `${this.days} días`,
      enabled: this.enabled,
      headline: this.previewDesc,
      sub:     this.kind === 'Liquidez'
                 ? 'Bono de liquidez para tu saldo'
                 : 'Tiradas gratis en tus slots favoritos',
      terms: [
        this.kind === 'Liquidez'
          ? 'Liquidez acreditada al activar el bono.'
          : `${this.spins} giros gratis acreditados al activar.`,
        this.noReq
          ? 'Sin requisito de apuesta: las ganancias son dinero real.'
          : 'Requisito de apuesta de 20x el monto del bono.',
        `Válido durante ${this.days} días desde la activación.`,
      ],
      games: this.kind === 'Liquidez'
               ? ['Todos los juegos']
               : ['Gates of Biozin', 'Wanted', 'Sugar Rush'],
    };
    ADMIN_BONOS.unshift(b);
    this.router.navigate(['/admin/bonos']);
  }

  goBack() { this.router.navigate(['/admin/bonos']); }
}