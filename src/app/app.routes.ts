import { Routes } from '@angular/router';

// `depth` define el nivel jerárquico de cada pantalla. La animación
// de rutas compara el orden entrante vs saliente: mayor = avance
// (entra desde la derecha), menor = retroceso (entra desde la
// izquierda). Las pestañas del bottom-nav comparten depth (5) pero
// llevan `tab` (0..4) para deslizarse según su posición en la barra.
export const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  {
    path: 'splash',
    data: { depth: 1 },
    loadComponent: () => import('./Auth/splash/splash.component').then(m => m.SplashPage),
  },
  {
    path: 'welcome',
    data: { depth: 2 },
    loadComponent: () => import('./Auth/welcome/welcome.component').then(m => m.WelcomePage),
  },
  {
    path: 'guest',
    data: { depth: 3 },
    loadComponent: () => import('./User/guest/guest.component').then(m => m.GuestPage),
  },
  {
    path: 'auth/login',
    data: { depth: 3 },
    loadComponent: () => import('./Auth/login/login.component').then(m => m.LoginPage),
  },
  {
    path: 'auth/register',
    data: { depth: 4 },
    loadComponent: () => import('./Auth/register/register.component').then(m => m.RegisterPage),
  },
  {
    path: 'auth/forgot',
    data: { depth: 4 },
    loadComponent: () => import('./Auth/RecoverPassword/forgot-password/forgot-password.component').then(m => m.ForgotPage),
  },
  {
    path: 'auth/verificar',
    data: { depth: 5 },
    loadComponent: () => import('./Auth/RecoverPassword/verify-password/verify-password.component').then(m => m.VerificarPage),
  },
  {
    path: 'auth/nueva',
    data: { depth: 6 },
    loadComponent: () => import('./Auth/RecoverPassword/new-password/new-password.component').then(m => m.NuevaPage),
  },
  {
    path: 'auth/actualizada',
    data: { depth: 7 },
    loadComponent: () => import('./Auth/RecoverPassword/confirmation/confirmation.component').then(m => m.ActualizadaPage),
  },
  {
    path: 'home',
    data: { depth: 5, tab: 0 },
    loadComponent: () => import('./User/home/home.component').then(m => m.HomePage),
  },
  {
    path: 'juegos',
    data: { depth: 5, tab: 1 },
    loadComponent: () => import('./User/games/games.component').then(m => m.JuegosPage),
  },
  {
    path: 'wallet',
    data: { depth: 5, tab: 2 },
    loadComponent: () => import('./User/Wallet/wallet/wallet.component').then(m => m.WalletPage),
  },
  {
    path: 'bonos',
    data: { depth: 5, tab: 3 },
    loadComponent: () => import('./User/bonuses/bonuses.component').then(m => m.BonosPage),
  },
  {
    path: 'perfil',
    data: { depth: 5, tab: 4 },
    loadComponent: () => import('./User/profile/profile/profile.component').then(m => m.PerfilPage),
  },
  {
    path: 'deposito',
    data: { depth: 6 },
    loadComponent: () => import('./User/Wallet/deposits/deposits.component').then(m => m.DepositoPage),
  },
  {
    path: 'retirar',
    data: { depth: 6 },
    loadComponent: () => import('./User/Wallet/withdrawals/withdrawals.component').then(m => m.RetirarPage),
  },
  {
    path: 'histjuegos',
    data: { depth: 6 },
    loadComponent: () => import('./User/profile/game-history/game-history.component').then(m => m.HistJuegosPage),
  },
  {
    path: 'pagos',
    data: { depth: 6 },
    loadComponent: () => import('./User/profile/payment-methods/payment-methods.component').then(m => m.PaymentMethods),
  },
  {
    path: 'config',
    data: { depth: 6 },
    loadComponent: () => import('./User/profile/config/config.component').then(m => m.ConfigPage),
  },
  {
    path: 'soporte',
    data: { depth: 6 },
    loadComponent: () => import('./User/profile/support/support.component').then(m => m.SoportePage),
  },
  {
    path: 'miperfil',
    data: { depth: 6 },
    loadComponent: () => import('./User/profile/personal-information/personal-information.component').then(m => m.MiPerfilPage),
  },
  {
    path: 'seguridad',
    data: { depth: 7 },
    loadComponent: () => import('./User/profile/config/security/security.component').then(m => m.SeguridadPage),
  },
  {
    path: 'transacciones',
    data: { depth: 6 },
    loadComponent: () => import('./User/Wallet/transactions/transactions.component').then(m => m.TransaccionesPage),
  },
  {
    path: 'bono/:id',
    data: { depth: 6 },
    loadComponent: () => import('./User/bonuses/bonus-details/bonus-details.component').then(m => m.BonoDetallePage),
  },
];
