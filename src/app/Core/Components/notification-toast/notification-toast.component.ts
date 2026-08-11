import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../Services/notification.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-notification-toast',
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.scss'],
})
export class NotificationToastComponent {
  readonly notificationService = inject(NotificationService);
}
