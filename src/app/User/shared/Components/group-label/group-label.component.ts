import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-group-label',
  template: `<div class="group-label"><ng-content></ng-content></div>`,
  styles: [`
    .group-label {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      letter-spacing: 1.5px;
      color: var(--gold-2);
      font-weight: 600;
      text-transform: uppercase;
      margin: 0 0 12px 2px;
    }
  `]
})
export class GroupLabelComponent {}