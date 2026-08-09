import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CLOSE } from '../../../shared/icons/icons';

interface BetRow {
  label:   string;
  sub?:    string;
  payout:  string;
  color:   string; // indicador visual
}

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-roulette-paytable',
  templateUrl: './roulette-paytable.component.html',
  styleUrls: ['./roulette-paytable.component.scss'],
})
export class RoulettePaytableComponent {
  @Output() closed = new EventEmitter<void>();

  iconClose = ICON_CLOSE;

  groups: { title: string; rows: BetRow[] }[] = [
    {
      title: 'Apuesta directa',
      rows: [
        { label: 'Número exacto',  sub: '0 – 36',          payout: '35:1', color: '#c79a32' },
      ],
    },
    {
      title: 'Apuestas medias',
      rows: [
        { label: 'Docenas',        sub: '1ª 12 / 2ª 12 / 3ª 12',  payout: '2:1', color: '#9b59b6' },
        { label: 'Columnas',       sub: 'Col. 1 / Col. 2 / Col. 3', payout: '2:1', color: '#9b59b6' },
      ],
    },
    {
      title: 'Apuestas simples',
      rows: [
        { label: 'Rojo / Negro',   sub: 'Color de la bola',          payout: '1:1', color: '#c0392b' },
        { label: 'Par / Impar',    sub: 'Número par o impar',         payout: '1:1', color: '#2980b9' },
        { label: '1-18 / 19-36',   sub: 'Mitad baja o alta',          payout: '1:1', color: '#27ae60' },
      ],
    },
  ];

  close()        { this.closed.emit(); }
  stop(e: Event) { e.stopPropagation(); }
}
