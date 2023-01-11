import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoginService } from '../services/login.service';
import { AlertMessages } from '../models/alert';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private loginService: LoginService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if ([401, 403].includes(err.status) && this.loginService.userValue) {
                // auto logout if 401 or 403 response returned from api
                this.loginService.logout();
            }
            switch (err.status) {

                case 404:
                    err.meesage = AlertMessages.ERROR_404
                    break;
                case 500:
                    err.meesage = AlertMessages.ERROR_500
                    break;
                default:
                    AlertMessages.ERROR_DEFAULT
                    break;
            }

            throw new Error(err.meesage);
        }))
    }
}