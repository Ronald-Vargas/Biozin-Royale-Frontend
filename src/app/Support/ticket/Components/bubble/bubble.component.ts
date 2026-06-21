import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketMsg } from 'src/app/Support/shared/support.data';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_DOC_ATTACH, ICON_DOWNLOAD, ICON_HEADSET, ICON_PERSON } from 'src/app/User/shared/icons/icons';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss'],
})
export class BubbleComponent {
  @Input() msg!: TicketMsg;

  iconHeadset  = ICON_HEADSET;
  iconPerson   = ICON_PERSON;
  iconAttach   = ICON_DOC_ATTACH;
  iconDownload = ICON_DOWNLOAD;

  get isSupport(): boolean { return this.msg.who === 'support'; }

  get senderName(): string {
    if (this.isSupport) {
      return this.msg.name ? `Soporte (${this.msg.name})` : 'Soporte';
    }
    return 'Usuario';
  }
}