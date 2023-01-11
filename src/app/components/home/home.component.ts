import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../../models/user';
import { LoginService } from '../../services/login.service';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
    user: User | null;

    constructor(private loginService: LoginService, private router: Router,
    ) {
        this.user = this.loginService.userValue;
    }

    navigateToTasks() {
        this.router.navigate(['/tasks']);
    }
}