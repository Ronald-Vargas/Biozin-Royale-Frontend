import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { UserRowComponent } from './Components/user-row/user-row.component';
import { ICON_SEARCH, ICON_FUNNEL, ICON_PEOPLE, ICON_CHEVRON_FWD } from 'src/app/User/shared/icons/icons';
import { UserAdminService } from 'src/app/Core/Services/user-admin.service';
import { AdminUser } from 'src/app/Core/Models/profile.models';
import { httpErrorMsg } from 'src/app/Core/Utils/http-error';


@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent, UserRowComponent,
  ],
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  iconSearch = ICON_SEARCH;
  iconFunnel = ICON_FUNNEL;
  iconPeople  = ICON_PEOPLE;
  iconChevron = ICON_CHEVRON_FWD;

  q = '';
  allUsers: AdminUser[] = [];
  loading = true;
  error = '';

  constructor(private router: Router, private userAdminService: UserAdminService) {}

  ngOnInit(): void {
    this.userAdminService.getAll().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.allUsers = res.returnValue;
        } else {
          this.error = res.strResponseMessage || 'No se pudieron cargar los usuarios.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = httpErrorMsg(err);
      },
    });
  }

  get list(): AdminUser[] {
    const query = this.q.trim().toLowerCase();
    if (!query) return this.allUsers;
    return this.allUsers.filter(u =>
      (u.displayName ?? '').toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  }

  goBack()        { this.router.navigate(['/admin']); }
  openUser(id: string) { this.router.navigate(['/admin/usuario', id]); }
  goTeam() { this.router.navigate(['/admin/equipo']); }
}
