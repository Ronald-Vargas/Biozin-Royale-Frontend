import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GoldButtonComponent } from '../../shared/Components/gold-button/gold-button.component';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { ICON_TIME, ICON_CHECK_OUT, ICON_TROPHY, ICON_SHIELD } from '../../shared/icons/icons';



interface BonoDetail {
  title:    string;
  icon:     string;
  headline: string;
  sub:      string;
  amount:   string;
  target:   string;
  expires:  string;
  terms:    string[];
  games:    string[];
}

@Component({
  standalone: true,
  imports: [
    CommonModule, ScreenShellComponent, SvgIconComponent, GoldButtonComponent,
  ],
  selector: 'app-bonus-details',
  templateUrl: './bonus-details.component.html',
  styleUrls: ['./bonus-details.component.scss'],
})


export class BonusDetailsComponent implements OnInit {
  iconTime  = ICON_TIME;
  iconCheck = ICON_CHECK_OUT;

  detail!: BonoDetail;

  private details: Record<string, BonoDetail> = {
    bienvenida: {
      title:    'Bono de Bienvenida',
      icon:     ICON_TROPHY,
      headline: '100% hasta $500',
      sub:      'Duplica tu primer depósito',
      amount:   '$250.00',
      target:   '$500.00',
      expires:  'Expira en 6d 23h',
      terms: [
        'Válido solo para el primer depósito de la cuenta.',
        'Requisito de apuesta de 30x el monto del bono.',
        'Depósito mínimo de $20 para activar el bono.',
        'Las ganancias del bono tienen un límite de retiro de $2,000.',
        'El bono expira a los 30 días si no se completa el requisito.',
      ],
      games: ['Tragamonedas', 'Ruleta', 'Blackjack'],
    },
    cashback: {
      title:    'Cashback Semanal',
      icon:     ICON_SHIELD,
      headline: '10% Cashback',
      sub:      'Recupera parte de tus pérdidas',
      amount:   '$48.00',
      target:   'Sin límite',
      expires:  'Se acredita en 3d 12h',
      terms: [
        'Se calcula sobre las pérdidas netas de la semana.',
        'Sin requisito de apuesta: el cashback es dinero real.',
        'Se acredita automáticamente cada lunes.',
        'Aplica a todos los juegos del casino.',
      ],
      games: ['Todos los juegos'],
    },
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || 'bienvenida';
    this.detail = this.details[id] || this.details['bienvenida'];
  }

  get progressPct(): number {
    if (this.detail.target === 'Sin límite') return 100;
    const cur  = parseFloat(this.detail.amount.replace(/[^0-9.]/g, ''));
    const goal = parseFloat(this.detail.target.replace(/[^0-9.]/g, ''));
    if (!goal) return 0;
    return Math.min(100, Math.round((cur / goal) * 100));
  }

  get hasLimit(): boolean { return this.detail.target !== 'Sin límite'; }

  goBack() { this.router.navigate(['/bonos']); }
  claim()  { this.router.navigate(['/bonos']); }
}