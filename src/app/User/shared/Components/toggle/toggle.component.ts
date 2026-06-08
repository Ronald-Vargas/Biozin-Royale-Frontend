import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
})
export class ToggleComponent {
  @Input()  on = false;
  @Output() changed = new EventEmitter<boolean>();

  click(event: Event) {
    event.stopPropagation();
    this.changed.emit(!this.on);
  }
}