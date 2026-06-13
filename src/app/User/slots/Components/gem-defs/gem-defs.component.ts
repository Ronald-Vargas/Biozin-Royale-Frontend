import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SYM_COLORS } from '../../slots.symbols';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-gem-defs',
  templateUrl: './gem-defs.component.html',
})
export class GemDefsComponent {
  entries = Object.entries(SYM_COLORS).map(([key, c]) => ({
    key,
    light: c[0],
    mid:   c[1],
    dark:  c[2],
  }));
}