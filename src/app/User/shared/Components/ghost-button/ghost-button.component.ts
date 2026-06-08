import { Component, Output, EventEmitter } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [IonButton],
  selector: 'app-ghost-button',
  templateUrl: './ghost-button.component.html',
  styleUrls: ['./ghost-button.component.scss'],
})
export class GhostButtonComponent {
  @Output() clicked = new EventEmitter<void>();
}