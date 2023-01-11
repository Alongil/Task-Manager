import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { TasksService } from '../../services/tasks.service';
import { AlertService } from '../../services/alert.service';
import { Task } from '../../models/task'
import { AlertMessages } from '../../models/alert';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: FormGroup | any;;
    id: string | number = '';
    isAddMode: boolean = true;
    loading = false;
    submitted = false;
    tasks: any = []
    taskToUpdate: Task | any;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private tasksService: TasksService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
        // in case user refresh inside edit/add component
        this.tasksService.tasksGlobalValue ? this.tasks = this.tasksService.tasksGlobalValue : this.getTasksFromServer();
        this.form = this.isAddMode ?  this.formBuilder.group({
            title: ['', Validators.required],
        }) : this.formBuilder.group({
            title: ['', Validators.required],
            completed: ['', Validators.required],
        });;
        // dont call api if id larger than 200 beacuse we will get an error
        if (+this.id > 200) {
            this.setTaskToUpdateFormValue();
            return

        }

        if (!this.isAddMode) {
            this.tasksService.getTaskById(this.id)
                .pipe(first())
                .subscribe({
                    next: (resp: any) => {
                        this.setTaskToUpdateFormValue()
                    },
                    error: (error: any) => {
                        this.alertService.error(error);
                        this.loading = false;
                    }
                });
        }

    }

    setTaskToUpdateFormValue() {
        let tempTask = this.tasks.filter((task: Task) => task.id === +this.id)
        this.taskToUpdate = tempTask[0]
        // if using a real server, should put the server response in here
        this.form.patchValue(this.taskToUpdate)

    }

    getTasksFromServer() {
        this.tasksService.getUserTasks()
            .pipe(first())
            .subscribe({
                next: (tasksFromServer) => {
                    this.tasks = tasksFromServer
                    this.tasksService.updateGlobalTasks(tasksFromServer)
                }, error: error => {
                    this.alertService.error(error.message);
                }
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
        if (this.isAddMode) {
            this.createTask();
        } else {
            this.updateTask()
        }
    }

    private createTask() {
        this.tasksService.createTask(this.form.value)
            .pipe(first())
            .subscribe({
                next: (newTaskResponse: any) => {
                    this.handleNewTask(newTaskResponse)
                },
                error: (error: any) => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private setTaskToUpdate(): Task {

        let tempTaskToUpdate = {
            id: +this.id,
            completed: JSON.parse(this.form.value.completed),
            title: this.form.value.title
        }

        return tempTaskToUpdate

    }



    private updateTask() {
        this.taskToUpdate = this.setTaskToUpdate();
        if (+this.id < 200) {
            this.tasksService.updateTask(this.taskToUpdate)
                .pipe(first())
                .subscribe({
                    next: (updatedTaskResponse) => {
                        this.handleUpdateTask(updatedTaskResponse)
                    },
                    error: (error: any) => {
                        this.alertService.error(error);
                        this.loading = false;
                    }
                });
        } else {
            this.handleUpdateNewTask();
        }

    }






    // updates the global tasks value with the new task value from mock server
    private handleNewTask(newTaskResponse: any,) {
        let response = JSON.parse(newTaskResponse.body)
          if(newTaskResponse.id && this.tasks[0].id  > 200) {
            newTaskResponse.id = this.tasks[0].id + 1
        }
       
        let newTask = { ...response, completed: false, id: newTaskResponse.id, }

        this.tasks.unshift(newTask)
        this.tasksService.updateGlobalTasks(this.tasks);
        this.router.navigate(['../'], { relativeTo: this.route });
        this.alertService.success(AlertMessages.SUCCESS_ADD, { keepAfterRouteChange: true });

    }
    private handleUpdateNewTask() {
        let index = this.tasks.findIndex((task: Task) => task.id === +this.taskToUpdate.id);
        if (index !== -1) {
            this.tasks.splice(index, 1, this.taskToUpdate);
            this.tasksService.updateGlobalTasks(this.tasks);
        }
        this.router.navigate(['../../'], { relativeTo: this.route });
        this.alertService.success(AlertMessages.SUCCESS_UPDATE, { keepAfterRouteChange: true });

    }

    // updates the global tasks value with the new task value from mock server
    private handleUpdateTask(updatedTaskResponse: any) {
        let response = JSON.parse(updatedTaskResponse.body)
        let updatedTask = { ...response, id: updatedTaskResponse.id }
        let index = this.tasks.findIndex((task: Task) => task.id === updatedTask.id);
        if (index !== -1) {
            this.tasks.splice(index, 1, updatedTask);
            this.tasksService.updateGlobalTasks(this.tasks);
        }
        this.router.navigate(['../../'], { relativeTo: this.route });
        this.alertService.success(AlertMessages.SUCCESS_UPDATE, { keepAfterRouteChange: true });


    }


}