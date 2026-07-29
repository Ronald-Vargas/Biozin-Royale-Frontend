import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonSpinner } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [CommonModule, IonButton, IonSpinner],
  selector: 'app-gold-button',
  templateUrl: './gold-button.component.html',
  styleUrls: ['./gold-button.component.scss'],
})
export class GoldButtonComponent {
<<<<<<< HEAD
  @Input()  loading = false;
  @Input()  disabled = false;
  @Output() clicked = new EventEmitter<void>();
=======
  @Input()  loading  = false;
  @Input()  disabled = false;
  @Output() clicked  = new EventEmitter<void>();
>>>>>>> develop
  onClick() { if (!this.loading && !this.disabled) this.clicked.emit(); }
}