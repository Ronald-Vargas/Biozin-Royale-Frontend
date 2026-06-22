import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GhostButtonComponent } from '../../shared/Components/ghost-button/ghost-button.component';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { ICON_PERSON_FILLED, ICON_CHEVRON_FWD, ICON_CARD, ICON_TIME, ICON_GIFT_OUTLINE, ICON_SETTINGS, ICON_HELP } from '../../shared/icons/icons';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { PerfilResultado } from 'src/app/Core/Models/auth.models';



interface InfoRow { k: string;}

interface MenuItem {
  label: string;
  icon:  string;
  route: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent, GhostButtonComponent],
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  loading = false;
  errorMsg = '';

  iconPerson  = ICON_PERSON_FILLED;
  iconChevron = ICON_CHEVRON_FWD;

  perfil: PerfilResultado | null = null;
  info: InfoRow[] = [];
  form: FormGroup;

  
  menu: MenuItem[] = [
    { label: 'Métodos de pago', icon: ICON_CARD, route: '/pagos' },
    { label: 'Historial de juego', icon: ICON_TIME,         route: '/histjuegos' },
    { label: 'Mis bonos',          icon: ICON_GIFT_OUTLINE, route: '/bonos' },
    { label: 'Configuración',      icon: ICON_SETTINGS,     route: '/config' },
    { label: 'Soporte',            icon: ICON_HELP,         route: '/soporte' },
  ];



  constructor(private router: Router, private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      displayName: [''],
      username: [''],
    });
  }




  ngOnInit(): void {
    this.loading = true;
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError || !res.returnValue) {
          this.errorMsg = res.strResponseMessage || 'No se pudo cargar el perfil.';
          return;
        }
        this.aplicarPerfil(res.returnValue);
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'No se pudo conectar con el servidor.';
      },
    });
  }


  private aplicarPerfil(perfil: PerfilResultado): void {
      this.perfil = perfil;
      this.info = [
      { k: perfil.displayName || '—'},
      { k: '@' + perfil.username },
      ];
    }
  


  goBack()     { this.router.navigate(['/home'], { replaceUrl: true }); }
  goProfile()  { this.router.navigate(['/miperfil']); }
  goTo(route: string) { this.router.navigate([route]); }
  logout()     { this.router.navigate(['/welcome'], { replaceUrl: true }); }
}
