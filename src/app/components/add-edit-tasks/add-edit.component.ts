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
        this.initData()
    }

    private initData() {
        this.tasksService.tasksGlobalValue ? this.tasks = this.tasksService.tasksGlobalValue : this.getTasksFromServer();
        this.form = this.initFormData();
        // dont call api if id larger than 200 beacuse we will get an error
        if (!this.isAddMode) {
            +this.id > 200 ?  this.setTaskFormValue() : this.getTaskById()
        }
    }

    private initFormData() {
        if(this.isAddMode) {
            return  this.formBuilder.group({
                title: ['', Validators.required],
            })
        } 
        return this.formBuilder.group({
            title: ['', Validators.required],
            completed: ['', Validators.required],
        });
    }

   private getTaskById() {
        this.tasksService.getTaskById(this.id)
        .pipe(first())
        .subscribe({
            next: (resp: any) => {
                this.setTaskFormValue()
            },
            error: (error: any) => {
                this.alertService.error(error,  { keepAfterRouteChange: true });
                this.router.navigateByUrl('/')
                this.loading = false;
            }
        });
    }

    setTaskFormValue() {
        let tempTask = this.tasks.filter((task: Task) => task.id === +this.id)
        this.taskToUpdate = tempTask[0]
        if(!this.taskToUpdate) {
           this.alertService.error(AlertMessages.ERROR_404, { keepAfterRouteChange: true })
           this.router.navigateByUrl('/')

        }
        // if using a real server, should put the server response in here
        this.form.patchValue(this.taskToUpdate)

    }

    getTasksFromServer() {
        this.tasksService.getUserTasks()
            .pipe(first())
            .subscribe({
                next: (tasksFromServer) => {
                    this.tasksService.updateGlobalTasks(tasksFromServer)
                    this.tasks = tasksFromServer
                }, error: error => {
                    this.alertService.error(error.message);
                }
            });
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();
        if (this.form.invalid) return 
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

    private setUpdatedTaskValue(): Task {
        let updatedTaskValue = {
            id: +this.id,
            completed: JSON.parse(this.form.value.completed),
            title: this.form.value.title
        }

        return updatedTaskValue

    }



    private updateTask() {
        let updatedTaskValue = this.setUpdatedTaskValue();
        if (+this.id < 200) {
            // update the task with the response from server if id smaller than 200 
            this.tasksService.updateTask(updatedTaskValue)
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
            // handleing the update of a task that has been added, nessecery becase we have no db
            this.handleUpdateNewTask(updatedTaskValue);
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
        this.navigateToTasksPage()
        this.alertService.success(AlertMessages.SUCCESS_ADD, { keepAfterRouteChange: true });

    }
    private handleUpdateNewTask(updatedTaskValue: Task) {
        let index = this.tasks.findIndex((task: Task) => task.id === +updatedTaskValue.id);
        if (index !== -1) {
            this.tasks.splice(index, 1, updatedTaskValue);
            this.tasksService.updateGlobalTasks(this.tasks);
        }
        this.navigateToTasksPage()
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
        this.navigateToTasksPage()
        this.alertService.success(AlertMessages.SUCCESS_UPDATE, { keepAfterRouteChange: true });

    }

    private navigateToTasksPage() {
        if(this.isAddMode) {
            this.router.navigate(['../'], { relativeTo: this.route })
            return
            
        }
        this.router.navigate(['../../'], { relativeTo: this.route })
    }


}