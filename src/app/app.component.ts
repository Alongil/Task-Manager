import { Component } from '@angular/core';

import { LoginService } from './services/login.service';
import { TasksService } from './services/tasks.service';
import { User } from './models/user';

@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent {
  user: User | null = null;

  constructor(private loginService: LoginService, private tasksService: TasksService) {
    this.loginService.user.subscribe(x => this.user = x);
  }

  logout() {
    this.tasksService.updateGlobalTasks(null)
    this.loginService.logout();
  }
}