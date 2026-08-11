import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_PERSON_CIRCLE, ICON_SEND } from 'src/app/User/shared/icons/icons';
import { SupportSheetComponent } from 'src/app/Support/ticket/Components/support-sheet/support-sheet.component';
import { InternalRequestService } from 'src/app/Core/Services/internal-request.service';
import { StaffSimple } from 'src/app/Core/Models/ticket.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, AtmosphereComponent, AdminHeaderComponent, SvgIconComponent, SupportSheetComponent],
  selector: 'app-crear-solicitud',
  templateUrl: './crear-solicitud.component.html',
  styleUrls: ['./crear-solicitud.component.scss'],
})
export class CrearSolicitudComponent implements OnInit {
  iconPerson = ICON_PERSON_CIRCLE;
  iconSend   = ICON_SEND;

  admins: StaffSimple[] = [];
  targetAdminId = '';
  subject = '';
  description = '';
  loading = false;
  errorMsg = '';
  sheetOpen = false;

  constructor(private router: Router, private internalRequestService: InternalRequestService) {}

  ngOnInit(): void {
    this.internalRequestService.listarAdmins().subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) this.admins = res.returnValue;
      },
    });
  }

  get targetAdminName(): string {
    return this.admins.find(a => a.id === this.targetAdminId)?.displayName || 'Selecciona un admin';
  }

  get valid(): boolean {
    return !!this.targetAdminId && this.subject.trim().length >= 4 && this.description.trim().length >= 8;
  }

  pickAdmin(id: string): void { this.targetAdminId = id; }

  goBack() { this.router.navigate(['/soporte/solicitudes']); }

  submit(): void {
    if (!this.valid || this.loading) return;

    this.loading = true;
    this.errorMsg = '';

    this.internalRequestService.crear({
      subject:       this.subject.trim(),
      description:   this.description.trim(),
      targetAdminId: this.targetAdminId,
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError || !res.returnValue) {
          this.errorMsg = res.strResponseMessage || 'No se pudo crear la solicitud.';
          return;
        }
        this.router.navigate(['/soporte/solicitud', res.returnValue.id]);
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'No se pudo conectar con el servidor.';
      },
    });
  }
}
