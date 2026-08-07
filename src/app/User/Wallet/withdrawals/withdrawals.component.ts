import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { GoldButtonComponent } from '../../shared/Components/gold-button/gold-button.component';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { ICON_PAYPAL, ICON_CARD } from '../../shared/icons/icons';
import { MetodosPagoService } from 'src/app/Core/Services/metodos-pago.service';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { MetodoPago } from 'src/app/Core/Models/metodos-pago.models';

type WithdrawStep = 'select' | 'confirm' | 'processing' | 'success' | 'error';

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, ScreenShellComponent,
    SvgIconComponent, GoldButtonComponent,
  ],
  selector: 'app-withdrawals',
  templateUrl: './withdrawals.component.html',
  styleUrls: ['./withdrawals.component.scss'],
})
export class WithdrawalsComponent implements OnInit, ViewWillEnter {
  step: WithdrawStep = 'select';

  metodos: MetodoPago[] = [];
  selectedMethod: MetodoPago | null = null;

  amount: number | null = 50;
  other  = '';
  loading  = false;
  errorMsg = '';

  newBalance:    number | null = null;
  withdrawnAmount = 0;
  receiptNumber: string | null = null;

  iconPaypal = ICON_PAYPAL;
  iconCard   = ICON_CARD;
  amounts    = [20, 50, 100, 200];

  readonly balance = this.balanceService.balance;

  constructor(
    private router: Router,
    private metodosPagoService: MetodosPagoService,
    private balanceService: BalanceService,
  ) {}

  ngOnInit(): void {
    this.balanceService.load();
    this.cargarMetodos();
  }

  ionViewWillEnter(): void {
    this.balanceService.reload();
    this.cargarMetodos();
  }

  private cargarMetodos(): void {
    this.loading = true;
    this.metodosPagoService.listar().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.metodos = res.returnValue;
          if (!this.selectedMethod && this.metodos.length > 0) {
            this.selectedMethod = this.metodos.find(m => m.isDefault) ?? this.metodos[0];
          }
        }
      },
      error: () => { this.loading = false; },
    });
  }

  get finalAmount(): number {
    if (this.other) return parseFloat(this.other) || 0;
    return this.amount ?? 0;
  }

  get currentBalance(): number { return this.balance() ?? 0; }

  get canWithdraw(): boolean {
    return !!this.selectedMethod
      && this.finalAmount >= 5
      && this.finalAmount <= this.currentBalance;
  }

  selectMethod(m: MetodoPago): void   { this.selectedMethod = m; }
  selectAmount(a: number): void       { this.amount = a; this.other = ''; }
  onOtherInput(val: string): void     { this.other = val.replace(/[^0-9.]/g, ''); this.amount = null; }
  isAmountActive(a: number): boolean  { return this.amount === a && this.other === ''; }
  isMethodActive(m: MetodoPago): boolean { return this.selectedMethod?.id === m.id; }

  goMetodosPago(): void { this.router.navigate(['/pagos']); }

  networkLabel(m: MetodoPago): string {
    return ({ visa: 'VISA', mastercard: 'MC', amex: 'AMEX', other: 'Tarjeta' } as Record<string, string>)[m.network ?? 'other'] ?? 'Tarjeta';
  }

  methodLabel(m: MetodoPago): string {
    if (m.type === 'paypal') return m.alias || 'PayPal';
    return `•••• ${m.lastFour}`;
  }

  methodSub(m: MetodoPago): string {
    if (m.type === 'paypal') return m.email ?? '';
    return `${m.cardHolder} · vence ${String(m.expiryMonth ?? '').padStart(2, '0')}/${String(m.expiryYear ?? '').slice(-2)}`;
  }

  async retirar(): Promise<void> {
    if (!this.canWithdraw || this.loading) return;
    this.loading        = true;
    this.errorMsg       = '';
    this.withdrawnAmount = this.finalAmount;
    this.step           = 'processing';

    try {
      const res = await firstValueFrom(this.metodosPagoService.retirar({
        paymentMethodId: this.selectedMethod!.id,
        amount:          this.finalAmount,
      }));

      if (res.blnError || !res.returnValue) {
        this.errorMsg = res.strResponseMessage || 'No se pudo procesar el retiro.';
        this.step     = 'error';
      } else {
        this.newBalance    = res.returnValue.newBalance;
        this.receiptNumber = res.returnValue.receiptNumber ?? null;
        this.step          = 'success';
      }
    } catch {
      this.errorMsg = 'Error de conexión. Intentá de nuevo.';
      this.step     = 'error';
    } finally {
      this.loading = false;
    }
  }

  goWallet(): void {
    if (this.newBalance !== null) {
      this.balanceService.set(this.newBalance);
    }
    this.router.navigate(['/wallet']);
  }

  reintentar(): void {
    this.step     = 'select';
    this.errorMsg = '';
  }

  goBack(): void {
    if (this.step === 'select') { this.router.navigate(['/wallet']); }
    else if (this.step === 'success' || this.step === 'error') { this.goWallet(); }
    else { this.step = 'select'; }
  }
}
