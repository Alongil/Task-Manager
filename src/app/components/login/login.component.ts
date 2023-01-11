import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { LoginService } from '../../services/login.service';
import { AlertService } from '../../services/alert.service';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
    form: FormGroup | any;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private loginService: LoginService,
        private alertService: AlertService
    ) {
        if (this.loginService.userValue) {
            this.router.navigateByUrl('')
        }
    }

    ngOnInit() {

        this.form = this.formBuilder.group({
            username: ['', Validators.required],
            email: ['', Validators.required]
        });
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.loginService.login(this.f.username.value, this.f.email.value)
            .pipe(first())
            .subscribe({
                next: () => {

                    this.router.navigateByUrl('/');

                },
                error: error => {
                    this.loading = false;
                    this.alertService.error(error.message);
                }
            });
    }
}