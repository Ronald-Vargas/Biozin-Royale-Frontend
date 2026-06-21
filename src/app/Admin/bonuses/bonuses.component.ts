import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ToggleComponent } from 'src/app/User/shared/Components/toggle/toggle.component';
import { ICON_ADD_CIRCLE } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { AdminBono, ADMIN_BONOS } from '../shared/admin.data';
import { KindBadgeComponent } from './Components/kind-badge/kind-badge.component';
;

@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent, KindBadgeComponent, ToggleComponent,
  ],
  selector: 'app-bonuses',
  templateUrl: './bonuses.component.html',
  styleUrls: ['./bonuses.component.scss'],
})
export class BonusesComponent {
  iconAddCircle = ICON_ADD_CIRCLE;

  bonos: AdminBono[] = ADMIN_BONOS;

  constructor(private router: Router) {}

  get activeCount(): number { return this.bonos.filter(b => b.enabled).length; }
  get totalCount():  number { return this.bonos.length; }

  toggle(b: AdminBono) { b.enabled = !b.enabled; }

  goBack()     { this.router.navigate(['/admin']); }
  goNew()      { this.router.navigate(['/admin/bonuses/new']); }
}