import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { loadScript } from '@paypal/paypal-js';
import { environment } from 'src/environments/environment';
import { GoldButtonComponent } from '../../shared/Components/gold-button/gold-button.component';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { MethodBadgeComponent } from './Components/method-badge/method-badge.component';
import { ICON_CARD, ICON_PAYPAL } from '../../shared/icons/icons';
import { DepositosService } from 'src/app/Core/Services/depositos.service';
import { BalanceService } from 'src/app/Core/Services/balance.service';

type DepositStep = 'select' | 'stripe-form' | 'paypal-button' | 'processing' | 'success' | 'error';

interface PayMethod { key: string; label: string; icon: string; badge: string; }

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, ScreenShellComponent,
    SvgIconComponent, GoldButtonComponent, MethodBadgeComponent,
  ],
  selector: 'app-deposits',
  templateUrl: './deposits.component.html',
  styleUrls: ['./deposits.component.scss'],
})
export class DepositsComponent {
  step: DepositStep = 'select';
  method = 'card';
  amount: number | null = 100;
  other  = '';
  loading = false;

  stripeError = '';
  newBalance: number | null = null;
  depositedAmount = 0;
  receiptNumber: string | null = null;
  errorMsg = '';

  private stripe: Stripe | null = null;
  private cardElement: StripeCardElement | null = null;
  private clientSecret = '';
  private pendingReceipt = '';

  iconCard   = ICON_CARD;
  iconPaypal = ICON_PAYPAL;

  payMethods: PayMethod[] = [
    { key: 'card',   label: 'Tarjeta de crédito/débito', icon: ICON_CARD,   badge: 'cards'  },
    { key: 'paypal', label: 'PayPal',                     icon: ICON_PAYPAL, badge: 'paypal' },
  ];

  amounts = [20, 50, 100, 200, 500];

  constructor(
    private router: Router,
    private depositosService: DepositosService,
    private balanceService: BalanceService,
  ) {}

  get finalAmount(): number {
    if (this.other) return parseFloat(this.other) || 0;
    return this.amount ?? 0;
  }

  selectMethod(key: string) { this.method = key; }
  selectAmount(a: number)   { this.amount = a; this.other = ''; }
  onOtherInput(val: string) { this.other = val.replace(/[^0-9.]/g, ''); this.amount = null; }
  isMethodActive(k: string) { return this.method === k; }
  isAmountActive(a: number) { return this.amount === a && !this.other; }

  async deposit() {
    if (this.finalAmount < 1 || this.loading) return;
    this.loading = true;
    this.errorMsg = '';

    if (this.method === 'card') {
      try {
        const res = await firstValueFrom(this.depositosService.iniciarStripe(this.finalAmount));
        if (res.blnError || !res.returnValue?.clientSecret) {
          this.errorMsg = res.strResponseMessage || 'No se pudo iniciar el pago.';
          this.loading  = false;
          return;
        }
        this.clientSecret    = res.returnValue.clientSecret;
        this.depositedAmount = this.finalAmount;
        this.pendingReceipt  = res.returnValue.receiptNumber ?? '';
        this.loading = false;
        this.step    = 'stripe-form';
        setTimeout(() => this.mountStripeElement(), 100);
      } catch {
        this.errorMsg = 'Error de conexión. Intentá de nuevo.';
        this.loading  = false;
      }
    } else {
      try {
        const res = await firstValueFrom(this.depositosService.iniciarPayPal(this.finalAmount));
        if (res.blnError || !res.returnValue?.orderId) {
          this.errorMsg = res.strResponseMessage || 'No se pudo iniciar el pago.';
          this.loading  = false;
          return;
        }
        const orderId        = res.returnValue.orderId;
        this.depositedAmount = this.finalAmount;
        this.pendingReceipt  = res.returnValue.receiptNumber ?? '';
        this.loading  = false;
        this.step     = 'paypal-button';
        setTimeout(() => this.renderPayPalButtons(orderId), 100);
      } catch {
        this.errorMsg = 'Error de conexión. Intentá de nuevo.';
        this.loading  = false;
      }
    }
  }

  private async mountStripeElement() {
    if (!this.stripe) {
      this.stripe = await loadStripe(environment.stripePublishableKey);
    }
    if (!this.stripe) return;

    const elements = this.stripe.elements();
    this.cardElement = elements.create('card', {
      style: {
        base: {
          color: '#C8C4A8',
          fontFamily: 'Montserrat, system-ui, sans-serif',
          fontSize:   '15px',
          '::placeholder': { color: '#7A7060' },
        },
        invalid: { color: '#E57373' },
      },
      hidePostalCode: true,
    });
    this.cardElement.mount('#stripe-card-element');
    this.cardElement.on('change', evt => {
      this.stripeError = evt.error?.message ?? '';
    });
  }

  async confirmStripePayment() {
    if (!this.stripe || !this.cardElement || this.loading) return;
    this.loading     = true;
    this.stripeError = '';

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret, {
      payment_method: { card: this.cardElement },
    });

    if (error) {
      this.stripeError = error.message ?? 'Error al procesar la tarjeta.';
      this.loading     = false;
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      this.receiptNumber = this.pendingReceipt || null;
      this.loading = false;
      this.step    = 'success';
    }
  }

  private async renderPayPalButtons(orderId: string) {
    try {
      const paypal = await loadScript({
        clientId:       environment.paypalClientId,
        currency:       'USD',
        disableFunding: 'card,credit,paylater',
      });
      if (!paypal?.Buttons) return;

      await paypal.Buttons({
        createOrder: () => Promise.resolve(orderId),
        onApprove:   async () => {
          this.step = 'processing';
          try {
            const res = await firstValueFrom(this.depositosService.capturarPayPal(orderId));
            if (!res.blnError && res.returnValue != null) {
              this.newBalance    = res.returnValue;
              this.receiptNumber = this.pendingReceipt || null;
              this.step          = 'success';
            } else {
              this.errorMsg = res.strResponseMessage || 'No se pudo confirmar el pago.';
              this.step     = 'error';
            }
          } catch {
            this.errorMsg = 'Error al confirmar el pago con PayPal.';
            this.step     = 'error';
          }
        },
        onError:  () => { this.errorMsg = 'Error al procesar el pago con PayPal.'; this.step = 'error'; },
        onCancel: () => { this.step = 'select'; },
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
      }).render('#paypal-button-container');
    } catch {
      this.errorMsg = 'No se pudo cargar el módulo de PayPal.';
      this.step     = 'error';
    }
  }

  cancelar() { this.step = 'select'; }

  goBack() {
    if (this.step === 'select') { this.router.navigate(['/wallet']); }
    else                        { this.cancelar(); }
  }

  goWallet() {
    if (this.newBalance !== null && this.newBalance > 0) {
      this.balanceService.set(this.newBalance);
    }
    this.router.navigate(['/wallet']);
  }

}
