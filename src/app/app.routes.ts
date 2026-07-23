import { Routes } from '@angular/router';
import { roleGuard } from './Core/Guards/role.guard';
import { realAccountGuard } from './Core/Guards/real-account.guard';

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
    loadComponent: () => import('./Auth/splash/splash.component').then(m => m.SplashComponent),
  },
  {
    path: 'welcome',
    data: { depth: 2 },
    loadComponent: () => import('./Auth/welcome/welcome.component').then(m => m.WelcomeComponent),
  },
  {
    path: 'guest',
    data: { depth: 3 },
    loadComponent: () => import('./User/guest/guest.component').then(m => m.GuestComponent),
  },
  {
    path: 'auth/login',
    data: { depth: 3 },
    loadComponent: () => import('./Auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'auth/callback',
    data: { depth: 3 },
    loadComponent: () => import('./Auth/callback/callback.component').then(m => m.CallbackComponent),
  },
  {
    path: 'auth/register',
    data: { depth: 4 },
    loadComponent: () => import('./Auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'auth/forgot',
    data: { depth: 4 },
    loadComponent: () => import('./Auth/RecoverPassword/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'auth/verificar',
    data: { depth: 5 },
    loadComponent: () => import('./Auth/RecoverPassword/verify-password/verify-password.component').then(m => m.VerifyPasswordComponent),
  },
  {
    path: 'auth/nueva',
    data: { depth: 6 },
    loadComponent: () => import('./Auth/RecoverPassword/new-password/new-password.component').then(m => m.NewPasswordComponent),
  },
  {
    path: 'auth/actualizada',
    data: { depth: 7 },
    loadComponent: () => import('./Auth/RecoverPassword/confirmation/confirmation.component').then(m => m.ConfirmationComponent),
  },
  {
    path: 'auth/recuperar',
    data: { depth: 5 },
    loadComponent: () => import('./Auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'auth/verificar-email',
    data: { depth: 5 },
    loadComponent: () => import('./Auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
  },
  {
    path: 'home',
    data: { depth: 5, tab: 0 },
    loadComponent: () => import('./User/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'juegos',
    data: { depth: 5, tab: 1 },
    loadComponent: () => import('./User/games/games.component').then(m => m.GamesComponent),
  },
  {
    path: 'wallet',
    data: { depth: 5, tab: 2 },
    canActivate: [realAccountGuard],
    loadComponent: () => import('./User/Wallet/wallet/wallet.component').then(m => m.WalletComponent),
  },
  {
    path: 'bonos',
    data: { depth: 5, tab: 3 },
    loadComponent: () => import('./User/bonuses/bonuses.component').then(m => m.BonusesComponent),
  },
  {
    path: 'perfil',
    data: { depth: 5, tab: 4 },
    loadComponent: () => import('./User/profile/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'deposito',
    data: { depth: 6 },
    canActivate: [realAccountGuard],
    loadComponent: () => import('./User/Wallet/deposits/deposits.component').then(m => m.DepositsComponent),
  },
  {
    path: 'retirar',
    data: { depth: 6 },
    canActivate: [realAccountGuard],
    loadComponent: () => import('./User/Wallet/withdrawals/withdrawals.component').then(m => m.WithdrawalsComponent),
  },
  {
    path: 'histjuegos',
    data: { depth: 6 },
    loadComponent: () => import('./User/profile/game-history/game-history.component').then(m => m.GameHistoryComponent),
  },
  {
    path: 'pagos',
    data: { depth: 6 },
    canActivate: [realAccountGuard],
    loadComponent: () => import('./User/profile/payment-methods/payment-methods.component').then(m => m.PaymentMethodsComponent),
  },
  {
    path: 'config',
    data: { depth: 6 },
    loadComponent: () => import('./User/profile/config/config.component').then(m => m.ConfigComponent),
  },
  {
    path: 'soporte',
    data: { depth: 6 },
    loadComponent: () => import('./User/profile/support/support.component').then(m => m.SupportComponent),
  },
  {
    path: 'miperfil',
    data: { depth: 6 },
    canActivate: [realAccountGuard],
    loadComponent: () => import('./User/profile/personal-information/personal-information.component').then(m => m.PersonalInformationComponent),
  },
  {
    path: 'seguridad',
    data: { depth: 7 },
    loadComponent: () => import('./User/profile/config/security/security.component').then(m => m.SecurityComponent),
  },
  {
    path: 'seguridad/cambiar-contrasena',
    data: { depth: 8 },
    loadComponent: () => import('./User/profile/config/security/change-password/change-password.component').then(m => m.ChangePasswordUserComponent),
  },
  {
    path: 'seguridad/pin',
    data: { depth: 8 },
    loadComponent: () => import('./User/profile/config/security/manage-pin/manage-pin.component').then(m => m.ManagePinComponent),
  },
  {
    path: 'transacciones',
    data: { depth: 6 },
    canActivate: [realAccountGuard],
    loadComponent: () => import('./User/Wallet/transactions/transactions.component').then(m => m.TransactionsComponent),
  },
  {
    path: 'bono/:id',
    data: { depth: 6 },
    loadComponent: () => import('./User/bonuses/bonus-details/bonus-details.component').then(m => m.BonusDetailsComponent),
  },
  {
    path: 'ruleta',
    data: { depth: 5, tab: 1 },
    canActivate: [realAccountGuard],
    loadComponent: () => import('./User/roulette/roulette.component').then(m => m.RouletteComponent),
  },
  {
    path: 'slots',
    canActivate: [realAccountGuard],
    loadComponent: () => import('./User/slots/slots.component').then(m => m.SlotsComponent),
  },
  {
    path: 'blackjack-lobby',
    canActivate: [realAccountGuard],
    loadComponent: () => import('./User/blackjack/Lobby/blackjack-lobby.component').then(m => m.BlackjackLobbyComponent),
  },
  {
    path: 'blackjack/:id',
    canActivate: [realAccountGuard],
    loadComponent: () => import('./User/blackjack/blackjack.component').then(m => m.BlackjackComponent),
  },
  {
    path: 'apuestas',
    data: { depth: 6 },
    canActivate: [realAccountGuard],
    loadComponent: () => import('./User/sports/apuestas.component').then(m => m.ApuestasComponent),
  },
  {
    path: 'admin/cambiar-clave',
    canActivate: [roleGuard(['admin', 'soporte'])],
    loadComponent: () => import('./Admin/change-password/change-password.component').then(m => m.ChangePasswordComponent),
  },
  {
  path: 'admin',
  canActivate: [roleGuard(['admin'])],
  loadComponent: () => import('./Admin/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'admin/usuarios',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/users/users.component').then(m => m.UsersComponent),
  },
  {
    path: 'admin/usuario/:id',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/users/user-detail/user-detail.component').then(m => m.UserDetailComponent),
  },
  {
    path: 'admin/usuario/:id/bono',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/users/user-bonus/user-bonus.component').then(m => m.UserBonusComponent),
  },
  {
    path: 'admin/usuario/:id/bonos',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/users/user-bonus-history/user-bonus-history.component').then(m => m.UserBonusHistoryComponent),
  },
  {
    path: 'admin/usuario/:id/apuestas',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/users/user-bets-history/user-bets-history.component').then(m => m.UserBetsHistoryComponent),
  },
  {
    path: 'admin/usuario/:id/bloquear',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/users/user-block/user-block.component').then(m => m.UserBlockComponent),
  },
  {
    path: 'admin/usuario/:id/transacciones',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/users/user-transactions/user-transactions.component').then(m => m.UserTransactionsComponent),
  },
  {
    path: 'admin/finanzas',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/finance/finance.component').then(m => m.AdminFinanceComponent),
  },
  {
    path: 'admin/reportes',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/reports/reports.component').then(m => m.AdminReportsComponent),
  },
  {
    path: 'admin/ajustes',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/settings/settings.component').then(m => m.AdminSettingsComponent),
  },
  {
    path: 'admin/miperfil',
    canActivate: [roleGuard(['admin', 'soporte'])],
    loadComponent: () => import('./Admin/personal-info/personal-info.component').then(m => m.AdminPersonalInfoComponent),
  },
  {
    path: 'admin/equipo',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/team/team.component').then(m => m.TeamComponent),
  },
  {
    path: 'admin/equipo/nuevo',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/team/new-member/new-member.component').then(m => m.NewMemberComponent),
  },
  {
    path: 'admin/equipo/creado',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/team/member-created/member-created.component').then(m => m.MemberCreatedComponent),
  },
  {
    path: 'admin/equipo/:id',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/team/member-detail/member-detail.component').then(m => m.MemberDetailComponent),
  },
  {
    path: 'support',
    canActivate: [roleGuard(['soporte'])],
    loadComponent: () => import('./Support/panel/panel.component').then(m => m.SupportPanelComponent),
  },
  {
    path: 'soporte/ticket/:id',
    canActivate: [roleGuard(['soporte'])],
    loadComponent: () => import('./Support/ticket/ticket.component').then(m => m.TicketComponent),
  },
  {
  path: 'soporte/tickets',
  canActivate: [roleGuard(['soporte'])],
  loadComponent: () => import('./Support/tickets/tickets.component').then(m => m.TicketsComponent),
  },
  {
    path: 'soporte/usuarios',
    canActivate: [roleGuard(['soporte'])],
    loadComponent: () => import('./Support/users/users.component').then(m => m.UsersComponent),
  },
  {
    path: 'soporte/reportes',
    canActivate: [roleGuard(['soporte'])],
    loadComponent: () => import('./Support/reports/reports.component').then(m => m.ReportsComponent),
  },
  {
    path: 'soporte/ajustes',
    canActivate: [roleGuard(['soporte'])],
    loadComponent: () => import('./Support/settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: 'create-ticket',
    canActivate: [realAccountGuard],
    loadComponent: () => import('./User/profile/support/create-ticket/create-ticket.component').then(m => m.CreateTicketComponent),
  },
  {
    path: 'ticket-ok',
    canActivate: [realAccountGuard],
    loadComponent: () => import('./User/profile/support/ticket-ok/ticket-ok.component').then(m => m.TicketOkComponent),
  },
  {
    path: 'admin/soporte',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/support/support.component').then(m => m.SupportComponent),
  },
  {
  path: 'admin/bonuses',
  canActivate: [roleGuard(['admin'])],
  loadComponent: () => import('./Admin/bonuses/bonuses.component').then(m => m.BonusesComponent),
  },
  {
    path: 'admin/bonuses/new',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./Admin/bonuses/new-bonuse/new-bonuse.component').then(m => m.NewBonuseComponent),
  },
];
