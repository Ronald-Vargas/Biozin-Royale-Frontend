import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-group-card',
  template: `<div class="group-card"><ng-content></ng-content></div>`,
  styles: [`
    .group-card {
      border-radius: 15px;
      overflow: hidden;
      margin-bottom: 24px;
      background: rgba(255, 255, 255, 0.022);
      border: 1px solid rgba(212, 167, 60, 0.26);
    }
  `]
})
export class GroupCardComponent {}