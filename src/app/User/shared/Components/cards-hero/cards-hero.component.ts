import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-cards-hero',
  templateUrl: './cards-hero.component.html',
  styleUrls: ['./cards-hero.component.scss'],
})
export class CardsHeroComponent {
  @Input() width = 270;
  @Input() delay = 0.15;
  @Input() src   = 'assets/cards-hero.png';
}