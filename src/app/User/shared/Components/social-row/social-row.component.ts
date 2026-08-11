import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-social-row',
  templateUrl: './social-row.component.html',
  styleUrls: ['./social-row.component.scss'],
})
export class SocialRowComponent {
  @Output() picked = new EventEmitter<string>();
}