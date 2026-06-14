import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent }     from '../../shared/Components/svg-icons/svg-icons.component';
import { TableCardComponent } from './Components/table-card/table-card.component';
import { BJ_TABLES, BjTable }   from './tables.data';
import { ICON_FILTER, ICON_ADD_CIRCLE } from '../../shared/icons/icons';

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent, TableCardComponent],
  selector: 'app-blackjack-lobby',
  templateUrl: './blackjack-lobby.component.html',
  styleUrls: ['./blackjack-lobby.component.scss'],
})


export class BlackjackLobbyComponent {
  iconFilter    = ICON_FILTER;
  iconAddCircle = ICON_ADD_CIRCLE;

  tables = BJ_TABLES;
  balance = '$1,250.00';

  constructor(private router: Router) {}

  goBack() { this.router.navigate(['/home']); }

  joinTable(t: BjTable) {
    // Pasamos la mesa por state de navegación
    this.router.navigate(['/blackjack', t.id], { state: { table: t } });
  }
}