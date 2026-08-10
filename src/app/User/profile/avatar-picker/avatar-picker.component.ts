import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { AvatarService } from 'src/app/Core/Services/avatar.service';
import { ProfileService } from 'src/app/Core/Services/profile.service';
import { AvatarResultado } from 'src/app/Core/Models/profile.models';

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent],
  selector: 'app-avatar-picker',
  templateUrl: './avatar-picker.component.html',
  styleUrls: ['./avatar-picker.component.scss'],
})
export class AvatarPickerComponent implements OnInit {
  avatars: AvatarResultado[] = [];
  selectedId: number | null = null;
  loading    = true;
  saving     = false;
  errorMsg   = '';

  constructor(
    private router: Router,
    private avatarService: AvatarService,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe((res) => {
      if (!res.blnError && res.returnValue?.avatarUrl) {
        // Pre-seleccionar avatar actual si hay uno guardado
      }
    });

    this.avatarService.listar().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.avatars = res.returnValue;
        }
      },
      error: () => { this.loading = false; this.errorMsg = 'No se pudieron cargar los avatares.'; },
    });
  }

  select(avatar: AvatarResultado): void {
    if (this.saving) return;
    this.selectedId = avatar.id;
    this.saving     = true;
    this.errorMsg   = '';

    this.avatarService.actualizar(avatar.id).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.blnError) {
          this.errorMsg = res.strResponseMessage || 'No se pudo guardar.';
        } else {
          this.router.navigate(['/perfil']);
        }
      },
      error: () => { this.saving = false; this.errorMsg = 'Error de conexión.'; },
    });
  }

  goBack(): void { this.router.navigate(['/perfil']); }
}
