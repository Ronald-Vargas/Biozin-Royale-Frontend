import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent }     from '../../shared/Components/svg-icons/svg-icons.component';
import { BJ_TABLES, BjTable }   from './tables.data';
import { ICON_FILTER, ICON_ADD_CIRCLE, ICON_ADD } from '../../shared/icons/icons';
import { TableCardComponent } from './Components/table-card/table-card.component';
import { AuthService } from 'src/app/Core/Services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent, TableCardComponent],
  selector: 'app-blackjack-lobby',
  templateUrl: './blackjack-lobby.component.html',
  styleUrls: ['./blackjack-lobby.component.scss'],
})
export class BlackjackLobbyComponent implements OnInit {
  iconFilter    = ICON_FILTER;
  iconAddCircle = ICON_ADD_CIRCLE;
  iconAdd       = ICON_ADD;

  tables = BJ_TABLES;
  balance = 1250;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.currentProfile()?.isGuest) {
      this.balance = 0;
      return;
    }
    const stored = parseFloat(localStorage.getItem('biozin_balance') || '');
    if (!isNaN(stored)) this.balance = stored;
  }

  fmt(n: number): string {
    return '$' + Number(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  goBack()     { this.router.navigate(['/home']); }
  goDeposito() { this.router.navigate(['/deposito']); }

  joinTable(t: BjTable) {
    this.router.navigate(['/blackjack', t.id], { state: { table: t } });
  }
}