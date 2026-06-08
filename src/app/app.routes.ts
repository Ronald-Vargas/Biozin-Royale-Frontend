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
    loadComponent: () => import('./splash/splash.page').then(m => m.SplashPage),
  },
  {
    path: 'welcome',
    data: { depth: 2 },
    loadComponent: () => import('./welcome/welcome.page').then(m => m.WelcomePage),
  },
  {
    path: 'guest',
    data: { depth: 3 },
    loadComponent: () => import('./guest/guest.component').then(m => m.GuestPage),
  },
  {
    path: 'auth/login',
    data: { depth: 3 },
    loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'auth/register',
    data: { depth: 4 },
    loadComponent: () => import('./auth/register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'auth/forgot',
    data: { depth: 4 },
    loadComponent: () => import('./auth/forgot/forgot.component').then(m => m.ForgotPage),
  },
  {
    path: 'auth/verificar',
    data: { depth: 5 },
    loadComponent: () => import('./auth/verificar/verificar.component').then(m => m.VerificarPage),
  },
  {
    path: 'auth/nueva',
    data: { depth: 6 },
    loadComponent: () => import('./auth/nueva/nueva.component').then(m => m.NuevaPage),
  },
  {
    path: 'auth/actualizada',
    data: { depth: 7 },
    loadComponent: () => import('./auth/actualizada/actualizada.component').then(m => m.ActualizadaPage),
  },
  {
    path: 'home',
    data: { depth: 5, tab: 0 },
    loadComponent: () => import('./home/home.component').then(m => m.HomePage),
  },
  {
    path: 'juegos',
    data: { depth: 5, tab: 1 },
    loadComponent: () => import('./juegos/juegos.component').then(m => m.JuegosPage),
  },
  {
    path: 'wallet',
    data: { depth: 5, tab: 2 },
    loadComponent: () => import('./wallet/wallet.component').then(m => m.WalletPage),
  },
  {
    path: 'bonos',
    data: { depth: 5, tab: 3 },
    loadComponent: () => import('./bonos/bonos.component').then(m => m.BonosPage),
  },
  {
    path: 'perfil',
    data: { depth: 5, tab: 4 },
    loadComponent: () => import('./perfil/perfil.component').then(m => m.PerfilPage),
  },
  {
    path: 'deposito',
    data: { depth: 6 },
    loadComponent: () => import('./deposito/deposito.component').then(m => m.DepositoPage),
  },
  {
    path: 'retirar',
    data: { depth: 6 },
    loadComponent: () => import('./retirar/retirar.component').then(m => m.RetirarPage),
  },
  {
    path: 'histjuegos',
    data: { depth: 6 },
    loadComponent: () => import('./hist-juegos/hist-juegos.component').then(m => m.HistJuegosPage),
  },
  {
    path: 'pagos',
    data: { depth: 6 },
    loadComponent: () => import('./pagos/pagos.component').then(m => m.PagosPage),
  },
  {
    path: 'config',
    data: { depth: 6 },
    loadComponent: () => import('./config/config.component').then(m => m.ConfigPage),
  },
  {
    path: 'soporte',
    data: { depth: 6 },
    loadComponent: () => import('./soporte/soporte.component').then(m => m.SoportePage),
  },
  {
    path: 'miperfil',
    data: { depth: 6 },
    loadComponent: () => import('./mi-perfil/mi-perfil.component').then(m => m.MiPerfilPage),
  },
  {
    path: 'seguridad',
    data: { depth: 7 },
    loadComponent: () => import('./seguridad/seguridad.component').then(m => m.SeguridadPage),
  },
  {
    path: 'transacciones',
    data: { depth: 6 },
    loadComponent: () => import('./transacciones/transacciones.component').then(m => m.TransaccionesPage),
  },
  {
    path: 'bono/:id',
    data: { depth: 6 },
    loadComponent: () => import('./bonos/bono-detalle/bono-detalle.component').then(m => m.BonoDetallePage),
  },
];
