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
  @Input()  loading = false;
  @Output() clicked = new EventEmitter<void>();
  onClick() { if (!this.loading) this.clicked.emit(); }
}