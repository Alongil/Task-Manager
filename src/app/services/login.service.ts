import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user';


@Injectable({ providedIn: 'root' })
export class LoginService {
    private userSubject: BehaviorSubject<User | null>;
    public user: Observable<User | null>;

    constructor(
        private router: Router,
        private http: HttpClient,
    ) {
        let currUser = localStorage.getItem('user');
        this.userSubject = currUser ? new BehaviorSubject<User | null>(JSON.parse(currUser)) : new BehaviorSubject<User | null>(null);
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): User | null {
        return this.userSubject.value;
    }

    login(username: string, email: string) {
        return this.http.get<User[]>(`${environment.apiUrl}users/`)
            .pipe(
                tap(users => {
                    let user = users.find((user: User) => user.email === email && user.username === username);
                    if (user) {
                        localStorage.setItem('user', JSON.stringify(user));
                        this.userSubject.next(user);
                        return user;
                    } else {
                        throw new Error("Invalid username or email")
                    }
                }));
    }
    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.userSubject.next(null);
        this.router.navigate(['/login']);
    }
}