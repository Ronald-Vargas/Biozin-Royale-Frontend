import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../../shared/Components/svg-icons/svg-icons.component';
import { FACE_TINTS } from '../../tables.data';
import { ICON_PERSON } from '../../../../shared/icons/icons';

interface Avatar { tint: string; z: number; ml: string; }

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-avatar-stack',
  templateUrl: './avatar-stack.component.html',
  styleUrls: ['./avatar-stack.component.scss'],
})
export class AvatarStackComponent implements OnChanges {
  @Input() count = 0;
  @Input() tint0 = 0;

  iconPerson = ICON_PERSON;

  avatars: Avatar[] = [];
  extra = 0;

  ngOnChanges() {
    const show = Math.min(this.count, 5);
    this.extra = this.count - show;
    this.avatars = Array.from({ length: show }, (_, i) => ({
      tint: FACE_TINTS[(this.tint0 + i) % FACE_TINTS.length],
      z:    show - i,
      ml:   i ? '-10px' : '0',
    }));
  }

  avatarBg(tint: string): string {
    return `radial-gradient(circle at 50% 35%, ${tint}, #2a2418)`;
  }
}