import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-emblem',
  templateUrl: './emblem.component.html',
  styleUrls: ['./emblem.component.scss'],
})
export class EmblemComponent {
  curl = 'M15,2 C5,7 5,12 11,15 C5,18 5,23 15,28';
}