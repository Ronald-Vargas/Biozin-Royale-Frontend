import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { AdminUser, ADMIN_USERS } from '../shared/admin.data';
import { UserRowComponent } from './Components/user-row/user-row.component';
import { ICON_FUNNEL, ICON_SEARCH } from 'src/app/User/shared/icons/icons';


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
export class UsersComponent {
  iconSearch = ICON_SEARCH;
  iconFunnel = ICON_FUNNEL;


  q = '';
  allUsers: AdminUser[] = ADMIN_USERS;

  constructor(private router: Router) {}

  get list(): AdminUser[] {
    const query = this.q.trim().toLowerCase();
    if (!query) return this.allUsers;
    return this.allUsers.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  }

  goBack()        { this.router.navigate(['/admin']); }
  openUser(id: string) { this.router.navigate(['/admin/usuario', id]); }
}