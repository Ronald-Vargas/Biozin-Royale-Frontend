import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { GoldButtonComponent } from '../../shared/Components/gold-button/gold-button.component';
import { ICON_PAYPAL, ICON_CARD, ICON_SHIELD_CHECK, ICON_STAR, ICON_TRASH } from '../../shared/icons/icons';
import { MetodosPagoService } from 'src/app/Core/Services/metodos-pago.service';
import { MetodoPago } from 'src/app/Core/Models/metodos-pago.models';

type FormMode = 'none' | 'paypal' | 'card';

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ScreenShellComponent, SvgIconComponent, GoldButtonComponent,
  ],
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.scss'],
})
export class PaymentMethodsComponent implements OnInit {
  iconPaypal = ICON_PAYPAL;
  iconCard   = ICON_CARD;
  iconShield = ICON_SHIELD_CHECK;
  iconStar   = ICON_STAR;
  iconTrash  = ICON_TRASH;

  metodos:    MetodoPago[] = [];
  loading     = false;
  formMode: FormMode = 'none';
  saving      = false;
  errorMsg    = '';
  successMsg  = '';

  // PayPal form
  ppEmail     = '';
  ppAlias     = '';
  ppDefault   = false;
  ppEmailTouched = false;

  get ppEmailInvalid(): boolean {
    const v = this.ppEmail.trim();
    return !!v && !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(v);
  }

  // Card form
  cardNumber  = '';
  cardHolder  = '';
  cardExpiry  = '';    // "MM/YY"
  cardAlias   = '';
  cardDefault = false;

  constructor(
    private router: Router,
    private metodosPagoService: MetodosPagoService,
  ) {}

  ngOnInit(): void { this.cargar(); }

  private cargar(): void {
    this.loading = true;
    this.metodosPagoService.listar().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) this.metodos = res.returnValue;
      },
      error: () => { this.loading = false; },
    });
  }

  get paypalMetodos(): MetodoPago[] { return this.metodos.filter(m => m.type === 'paypal'); }
  get cardMetodos():   MetodoPago[] { return this.metodos.filter(m => m.type === 'card'); }

  mostrarFormPayPal(): void {
    this.formMode      = 'paypal';
    this.ppEmail       = ''; this.ppAlias = '';
    this.ppDefault     = this.metodos.length === 0;
    this.ppEmailTouched = false;
    this.errorMsg      = '';
  }

  mostrarFormCard(): void {
    this.formMode    = 'card';
    this.cardNumber  = ''; this.cardHolder = ''; this.cardExpiry = ''; this.cardAlias = '';
    this.cardDefault = this.metodos.length === 0;
    this.errorMsg    = '';
  }

  cancelar(): void { this.formMode = 'none'; this.errorMsg = ''; }

  onCardNumberInput(val: string): void {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = digits.replace(/(.{4})/g, '$1 ').trim();
  }

  onExpiryInput(val: string): void {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    this.cardExpiry = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  }

  async guardarPayPal(): Promise<void> {
    this.ppEmailTouched = true;
    if (!this.ppEmail.trim() || this.ppEmailInvalid || this.saving) return;
    this.saving = true; this.errorMsg = '';
    try {
      const res = await firstValueFrom(this.metodosPagoService.agregarPayPal({
        email: this.ppEmail.trim(), alias: this.ppAlias.trim() || null, isDefault: this.ppDefault,
      }));
      if (res.blnError || !res.returnValue) {
        this.errorMsg = res.strResponseMessage || 'No se pudo agregar la cuenta.';
      } else {
        this.formMode  = 'none';
        this.successMsg = 'Cuenta de PayPal agregada.';
        this.cargar();
        setTimeout(() => { this.successMsg = ''; }, 3000);
      }
    } catch { this.errorMsg = 'Error de conexión.'; }
    finally { this.saving = false; }
  }

  async guardarTarjeta(): Promise<void> {
    if (!this.cardNumber || !this.cardHolder || !this.cardExpiry || this.saving) return;
    this.saving = true; this.errorMsg = '';

    const parts = this.cardExpiry.split('/');
    const month = parseInt(parts[0] ?? '0', 10);
    const year  = parseInt('20' + (parts[1] ?? '0'), 10);

    try {
      const res = await firstValueFrom(this.metodosPagoService.agregarTarjeta({
        cardNumber:  this.cardNumber.replace(/\s/g, ''),
        cardHolder:  this.cardHolder.trim(),
        expiryMonth: month,
        expiryYear:  year,
        alias:       this.cardAlias.trim() || null,
        isDefault:   this.cardDefault,
      }));
      if (res.blnError || !res.returnValue) {
        this.errorMsg = res.strResponseMessage || 'No se pudo agregar la tarjeta.';
      } else {
        this.formMode   = 'none';
        this.successMsg = 'Tarjeta agregada correctamente.';
        this.cargar();
        setTimeout(() => { this.successMsg = ''; }, 3000);
      }
    } catch { this.errorMsg = 'Error de conexión.'; }
    finally { this.saving = false; }
  }

  async eliminar(m: MetodoPago): Promise<void> {
    try {
      const res = await firstValueFrom(this.metodosPagoService.eliminar(m.id));
      if (!res.blnError) this.cargar();
    } catch { /* silencioso */ }
  }

  async setPrincipal(m: MetodoPago): Promise<void> {
    if (m.isDefault) return;
    try {
      const res = await firstValueFrom(this.metodosPagoService.establecerPrincipal(m.id));
      if (!res.blnError) this.cargar();
    } catch { /* silencioso */ }
  }

  networkLabel(m: MetodoPago): string {
    return ({ visa: 'VISA', mastercard: 'MC', amex: 'AMEX', other: 'Tarjeta' } as Record<string, string>)[m.network ?? 'other'] ?? 'Tarjeta';
  }

  expiryLabel(m: MetodoPago): string {
    if (!m.expiryMonth || !m.expiryYear) return '';
    return `${String(m.expiryMonth).padStart(2, '0')}/${String(m.expiryYear).slice(-2)}`;
  }

  goBack(): void { this.router.navigate(['/perfil']); }
}
