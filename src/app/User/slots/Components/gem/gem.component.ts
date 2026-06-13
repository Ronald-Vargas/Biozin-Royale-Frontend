import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacetGemComponent } from '../facet-gem/facet-gem.component';
import { CrownGemComponent } from '../crown-gem/crown-gem.component';
import { RingGemComponent }  from '../ring-gem/ring-gem.component';

@Component({
  standalone: true,
  imports: [CommonModule, FacetGemComponent, CrownGemComponent, RingGemComponent],
  selector: 'app-gem',
  template: `
    <app-crown-gem *ngIf="sym === 'crown'"></app-crown-gem>
    <app-ring-gem  *ngIf="sym === 'ring'"></app-ring-gem>
    <app-facet-gem
      *ngIf="sym !== 'crown' && sym !== 'ring'"
      [colorKey]="sym"
    ></app-facet-gem>
  `,
})
export class GemComponent {
  @Input() sym = 'yellow';
}