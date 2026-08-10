import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { IonInput } from '@ionic/angular/standalone';
import { AsYouType, parsePhoneNumber } from 'libphonenumber-js/min';
import { Subscription } from 'rxjs';

const COUNTRY_NAMES: Record<string, string> = {
  CR: 'Costa Rica',   PA: 'Panamá',          SV: 'El Salvador',
  GT: 'Guatemala',    HN: 'Honduras',         NI: 'Nicaragua',
  US: 'Estados Unidos', MX: 'México',         CO: 'Colombia',
  VE: 'Venezuela',    PE: 'Perú',             EC: 'Ecuador',
  BO: 'Bolivia',      PY: 'Paraguay',         UY: 'Uruguay',
  AR: 'Argentina',    CL: 'Chile',            BR: 'Brasil',
  CU: 'Cuba',         DO: 'Rep. Dominicana',  ES: 'España',
  FR: 'Francia',      IT: 'Italia',           DE: 'Alemania',
  GB: 'Reino Unido',  PT: 'Portugal',         NL: 'Países Bajos',
  BE: 'Bélgica',      CH: 'Suiza',            CN: 'China',
  IN: 'India',        JP: 'Japón',            KR: 'Corea del Sur',
  AU: 'Australia',    NZ: 'Nueva Zelanda',    ZA: 'Sudáfrica',
  EG: 'Egipto',       AE: 'Emiratos Árabes',  SA: 'Arabia Saudita',
  RU: 'Rusia',        TR: 'Turquía',
};

@Component({
  standalone: true,
  imports: [CommonModule, IonInput],
  selector: 'app-phone-field',
  templateUrl: './phone-field.component.html',
  styleUrls: ['./phone-field.component.scss'],
})
export class PhoneFieldComponent implements OnInit, OnDestroy {
  @Input() label       = 'Teléfono';
  @Input() placeholder = '+506 8144 7441';
  @Input() control!: FormControl;

  displayValue = '';
  countryHint  = '';
  focused      = false;

  private sub?: Subscription;

  ngOnInit(): void {
    const initial = this.control?.value as string;
    if (initial) this.applyFormat(initial);

    this.sub = this.control?.valueChanges.subscribe((v: string) => {
      if (!v) { this.displayValue = ''; this.countryHint = ''; }
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onInput(event: any): void {
    const raw = (event.detail?.value ?? event.target?.value ?? '') as string;
    this.applyFormat(raw);
    const e164 = this.toE164(raw);
    this.control.setValue(e164, { emitEvent: true });
    this.control.markAsDirty();
  }

  onFocus(): void { this.focused = true; }
  onBlur():  void { this.focused = false; this.control.markAsTouched(); }

  get hasError(): boolean {
    return !!(this.control.touched && this.control.errors?.['phone']);
  }

  private applyFormat(raw: string): void {
    const formatter = new AsYouType();
    this.displayValue = formatter.input(raw);
    const code = formatter.getCountry();
    this.countryHint = code ? (COUNTRY_NAMES[code] ?? code) : '';
  }

  private toE164(raw: string): string {
    if (!raw || !raw.startsWith('+')) return raw;
    try {
      const parsed = parsePhoneNumber(raw);
      return parsed?.format('E.164') ?? raw.replace(/\s/g, '');
    } catch {
      return raw.replace(/\s/g, '');
    }
  }
}
