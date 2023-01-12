import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginService } from './login.service';

import { environment } from '../../environments/environment';

import { User } from '../models/user';
import { Task } from '../models/task';

@Injectable({ providedIn: 'root' })
export class TasksService {
    private user: User | null = null;
    private headers: { [key: string]: string } = { 'Content-type': 'application/json; charset=UTF-8' };
    public updateTasks: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
    public globalTasks = this.updateTasks.asObservable();


    constructor(
        private http: HttpClient,
        private loginService: LoginService
    ) {
        this.loginService.user.subscribe(x => this.user = x);
    }

    public get tasksGlobalValue(): Task[] | null {
        return this.updateTasks.value;
    }

    getUserTasks(params?: string | null) {
        let url = `${environment.apiUrl}users/${this.user?.id}/todos`;
        if (params) {
            url += params;
        }
        return this.http.get<Task[]>(url);
    }

    createTask(task: Task) {
        return this.http.post(`${environment.apiUrl}todos/`, {
            body: JSON.stringify({
                ...task,
                userId: this.user?.id,
            }),
            headers: this.headers,
        })
    }




    getTaskById(id: string | number) {
        return this.http.get<Task[]>(`${environment.apiUrl}todos?userId=${this.user?.id}&id=${id}`)
    }

    updateTask(task: Task) {
        return this.http.put(`${environment.apiUrl}todos/${task.id}`, {
            body: JSON.stringify({
                ...task, userId: this.user?.id,
            }),
            headers: this.headers,
        })
    }



    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}todos/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }

    updateGlobalTasks(tasks: Task[] | null) {
        this.updateTasks.next(tasks)
    }
}