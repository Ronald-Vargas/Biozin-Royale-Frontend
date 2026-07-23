import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-pin-input',
  templateUrl: './pin-input.component.html',
  styleUrls: ['./pin-input.component.scss'],
})
export class PinInputComponent {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChildren('box') boxes!: QueryList<ElementRef<HTMLInputElement>>;

  get digits(): string[] {
    const d = this.value.split('');
    while (d.length < 4) d.push('');
    return d.slice(0, 4);
  }

  setAt(i: number, raw: string): void {
    const clean = raw.replace(/[^0-9]/g, '').slice(-1);
    const arr = this.digits;
    arr[i] = clean;
    this.value = arr.join('');
    this.valueChange.emit(this.value);

    if (clean && i < 3) {
      setTimeout(() => this.boxes.get(i + 1)?.nativeElement.focus(), 0);
    }
  }

  onKey(i: number, e: KeyboardEvent): void {
    if (e.key === 'Backspace' && !this.digits[i] && i > 0) {
      this.boxes.get(i - 1)?.nativeElement.focus();
    }
  }

  trackByIndex(i: number): number {
    return i;
  }
}
