import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../shared/Components/screen-shell/screen-shell.component';
import { BonusCardComponent, ActiveBonus } from './Components/bonus-card/bonus-card.component';
import { BonusHistCardComponent, HistBonus } from './Components/bonus-hist-card/bonus-hist-card.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { PromotionService } from 'src/app/Core/Services/promotion.service';
import { Promotion, PromotionClaim } from 'src/app/Core/Models/promotion.models';
import { ICON_GIFT_FILLED, ICON_TROPHY } from 'src/app/User/shared/icons/icons';

interface Filter { key: string; label: string; }

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, BonusCardComponent, BonusHistCardComponent, SvgIconComponent],
  selector: 'app-bonuses',
  templateUrl: './bonuses.component.html',
  styleUrls: ['./bonuses.component.scss'],
})
export class BonusesComponent implements OnInit {
  iconGift   = ICON_GIFT_FILLED;
  iconTrophy = ICON_TROPHY;

  tab    = 'activos';
  filter = 'todos';
  loading = true;

  tabs = [
    { k: 'activos',   l: 'Activos' },
    { k: 'historial', l: 'Historial' },
  ];

  filters: Filter[] = [
    { key: 'todos',      label: 'Todos' },
    { key: 'completado', label: 'Usados' },
  ];

  activeBonuses: ActiveBonus[] = [];
  histBonuses: HistBonus[] = [];

  constructor(private router: Router, private promotionService: PromotionService) {}

  ngOnInit(): void {
    this.promotionService.getActive().subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          this.activeBonuses = res.returnValue.map(this.toActiveBonus);
        }
      },
    });

    this.promotionService.getMyClaims().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.histBonuses = res.returnValue.map(this.toHistBonus);
        }
      },
      error: () => { this.loading = false; },
    });
  }

  private toActiveBonus(p: Promotion): ActiveBonus {
    return {
      id:    p.id,
      title: p.title,
      desc:  p.description ?? `$${p.amount}`,
      time:  p.endsAt ? formatTimeLeft(p.endsAt) : 'Sin límite',
      icon:  'trophy',
    };
  }

  private toHistBonus(c: PromotionClaim): HistBonus {
    return {
      title:  c.promotion?.title ?? 'Bono',
      desc:   c.promotion?.description ?? (c.promotion ? `$${c.promotion.amount}` : ''),
      status: 'usado',
      date:   new Date(c.claimedAt).toLocaleString('es-CR'),
      icon:   'trophy',
    };
  }

  get histList(): HistBonus[] {
    return this.filter === 'todos'
      ? this.histBonuses
      : this.histBonuses.filter(b => b.status === this.filter);
  }

  goBack() { this.router.navigate(['/home'], { replaceUrl: true }); }
  goDetalle(id?: string) { if (id) this.router.navigate(['/bono', id]); }
}

function formatTimeLeft(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Expirado';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}
