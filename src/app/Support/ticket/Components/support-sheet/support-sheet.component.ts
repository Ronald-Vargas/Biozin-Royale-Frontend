import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InitialsComponent } from 'src/app/Support/shared/initials/initials.component';
import { TINTS } from 'src/app/Support/shared/support.data';
import { TicketStatusBadgeComponent } from 'src/app/Support/shared/ticket-status-badge/ticket-status-badge.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHECK_CIRCLE, ICON_PERSON_REMOVE } from 'src/app/User/shared/icons/icons';
import { StaffSimple } from 'src/app/Core/Models/ticket.models';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent, TicketStatusBadgeComponent, InitialsComponent],
  selector: 'app-support-sheet',
  templateUrl: './support-sheet.component.html',
  styleUrls: ['./support-sheet.component.scss'],
})
export class SupportSheetComponent {
  @Input() title = '';
  @Input() options: string[] = [];
  @Input() staffOptions: StaffSimple[] = [];
  @Input() current = '';
  @Input() mode: 'status' | 'agent' = 'status';
  @Output() pick  = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  iconCheck        = ICON_CHECK_CIRCLE;
  iconPersonRemove = ICON_PERSON_REMOVE;

  get useStaffOptions(): boolean {
    return this.mode === 'agent' && this.staffOptions.length > 0;
  }

  onPick(o: string) {
    this.pick.emit(o);
    this.close.emit();
  }

  onPickStaff(s: StaffSimple) {
    this.pick.emit(s.id);
    this.close.emit();
  }

  isSel(o: string): boolean { return o === this.current; }
  isSelStaff(id: string): boolean { return id === this.current; }

  agentTint(name: string): string {
    const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return TINTS[hash % TINTS.length];
  }
}