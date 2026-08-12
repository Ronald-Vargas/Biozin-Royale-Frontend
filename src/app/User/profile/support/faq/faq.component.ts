import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../../../shared/Components/svg-icons/svg-icons.component';
import {
  ICON_SLOTS, ICON_WALLET_OUTLINE, ICON_GIFT_OUTLINE,
  ICON_PERSON_OUTLINE, ICON_SHIELD, ICON_CHEVRON_DOWN, ICON_HELP_CIRC,
} from '../../../shared/icons/icons';

interface FaqItem {
  question: string;
  answer:   string;
  open:     boolean;
}

interface FaqSection {
  id:        string;
  title:     string;
  icon:      string;
  iconColor: string;
  items:     FaqItem[];
}

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent],
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent {
  iconHelp    = ICON_HELP_CIRC;
  iconChevron = ICON_CHEVRON_DOWN;

  sections: FaqSection[] = [
    {
      id: 'juegos',
      title: 'Juegos',
      icon: ICON_SLOTS,
      iconColor: 'var(--gold-1)',
      items: [
        {
          question: '¿Qué juegos están disponibles?',
          answer: 'Contamos con apuestas deportivas, tragamonedas, ruleta y blackjack. El catálogo se actualiza regularmente con nuevos títulos y modalidades.',
          open: false,
        },
        {
          question: '¿Los juegos son justos?',
          answer: 'Sí. Todos nuestros juegos utilizan un generador de números aleatorios (RNG) certificado e independiente, lo que garantiza resultados imparciales en cada partida.',
          open: false,
        },
        {
          question: '¿Qué sucede si se corta la conexión durante un juego?',
          answer: 'El estado de tu partida queda guardado en el servidor. Al reconectarte, podrás retomar exactamente donde lo dejaste. Si el resultado ya fue determinado, se acreditará automáticamente.',
          open: false,
        },
      ],
    },
    {
      id: 'wallet',
      title: 'Wallet',
      icon: ICON_WALLET_OUTLINE,
      iconColor: 'var(--gold-1)',
      items: [
        {
          question: '¿Cómo deposito dinero?',
          answer: 'Ve a Wallet → Depositar. Podés ingresar fondos con tarjeta de crédito/débito (Visa, Mastercard, Amex) a través de Stripe, o mediante PayPal. El proceso es inmediato y seguro.',
          open: false,
        },
        {
          question: '¿Cuánto tarda en acreditarse un depósito?',
          answer: 'Los depósitos con tarjeta y PayPal se acreditan de forma instantánea una vez que el pago es aprobado. No hay esperas.',
          open: false,
        },
        {
          question: '¿Cómo retiro mis ganancias?',
          answer: 'Ve a Wallet → Retirar, seleccioná el método de pago registrado (PayPal o tarjeta) e ingresá el monto. Los retiros por PayPal son automáticos; los retiros a tarjeta los procesa nuestro equipo de forma manual.',
          open: false,
        },
        {
          question: '¿Cuánto tarda un retiro?',
          answer: 'Los retiros por PayPal se procesan de forma automática y suelen reflejarse en tu cuenta en minutos. Los retiros a tarjeta pueden demorar entre 1 y 3 días hábiles.',
          open: false,
        },
        {
          question: '¿Hay límites de depósito o retiro?',
          answer: 'No existe un limite máximo de depósito o retiro.',
          open: false,
        },
        {
          question: '¿Cómo registro un método de pago?',
          answer: 'Ve a Perfil → Métodos de pago. Podés agregar cuentas de PayPal o tarjetas de crédito/débito. Se admiten hasta 10 métodos por cuenta.',
          open: false,
        },
      ],
    },
    {
      id: 'bonos',
      title: 'Bonos y Promociones',
      icon: ICON_GIFT_OUTLINE,
      iconColor: 'var(--gold-1)',
      items: [
        {
          question: '¿Qué es un bono de bienvenida?',
          answer: 'Es un beneficio otorgado a los nuevos usuarios. Generalmente consiste en un crédito extra, según la promoción vigente.',
          open: false,
        },
        {
          question: '¿Cómo canjeo un bono?',
          answer: 'Los bonos disponibles aparecen en la sección "Bonos" del menú inferior. Seleccioná el que querés activar y seguí las instrucciones indicadas.',
          open: false,
        },
        {
          question: '¿Cuándo vence un bono?',
          answer: 'El período de validez varía según el tipo de bono. Encontrarás la fecha de vencimiento en el detalle de cada bono activo dentro de la sección "Bonos".',
          open: false,
        },
      ],
    },
    {
      id: 'cuenta',
      title: 'Mi Cuenta',
      icon: ICON_PERSON_OUTLINE,
      iconColor: 'var(--gold-1)',
      items: [
        {
          question: '¿Cómo actualizo mis datos personales?',
          answer: 'Ve a Perfil → Mi perfil. Desde ahí podés actualizar tu nombre, fecha de nacimiento, país y teléfono.',
          open: false,
        },
        {
          question: '¿Cómo cambio mi contraseña?',
          answer: 'Ve a Perfil → Configuración → Seguridad. Ingresá tu contraseña actual y luego la nueva contraseña dos veces para confirmarla.',
          open: false,
        },
        {
          question: '¿Qué hago si olvidé mi contraseña?',
          answer: 'En la pantalla de inicio de sesión, tocá "¿Olvidaste tu contraseña?". Te enviaremos un correo con instrucciones para restablecerla.',
          open: false,
        },
        {
          question: '¿Cómo elimino mi cuenta?',
          answer: 'Para solicitar la eliminación de tu cuenta, contactá al equipo de soporte desde Perfil → Soporte → Crear ticket. El proceso puede tomar hasta 5 días hábiles.',
          open: false,
        },
      ],
    },
    {
      id: 'seguridad',
      title: 'Seguridad',
      icon: ICON_SHIELD,
      iconColor: 'var(--gold-1)',
      items: [
        {
          question: '¿Están seguros mis datos?',
          answer: 'Sí. Toda la comunicación está cifrada mediante TLS/HTTPS. La información sensible, como contraseñas y datos financieros, se almacena con encriptación adicional y nunca se comparte con terceros.',
          open: false,
        },
        {
          question: '¿Es confiable Biozin Royale?',
          answer: 'Somos una plataforma comprometida con la transparencia y el juego responsable. Nuestros juegos son auditados independientemente y operamos bajo estrictas políticas de seguridad.',
          open: false,
        },
        {
          question: '¿Cómo protejo mi cuenta?',
          answer: 'Usá una contraseña única y segura. No compartas tus credenciales con nadie. Biozin Royale nunca te pedirá tu contraseña por correo, WhatsApp u otros canales.',
          open: false,
        },
        {
          question: '¿Qué hago si detecto actividad sospechosa?',
          answer: 'Cambiá tu contraseña de inmediato desde Configuración → Seguridad y contactá al soporte. Nuestro equipo revisará la actividad de tu cuenta y tomará las medidas necesarias.',
          open: false,
        },
      ],
    },
  ];

  activeSection: string | null = null;

  constructor(private router: Router) {}

  toggleSection(id: string): void {
    this.activeSection = this.activeSection === id ? null : id;
  }

  toggleItem(item: FaqItem): void {
    item.open = !item.open;
  }

  goBack(): void { this.router.navigate(['/soporte']); }
}
