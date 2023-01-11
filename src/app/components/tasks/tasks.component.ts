import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { LoginService } from '../../services/login.service';
import { TasksService } from '../../services/tasks.service';
import { AlertService } from 'src/app/services/alert.service';
import { Task } from '../../models/task';

@Component({ templateUrl: 'tasks.component.html' })
export class TasksComponent implements OnInit {
    tasks: any;
    user: any;
    hideCompleted: boolean = false;
    tasksLimit: number | undefined = 20;
    params: string | null = null


    constructor(private loginService: LoginService, private alertService: AlertService, private tasksService: TasksService) { }

    ngOnInit() {
        this.getTasks()
    }

    getTasks() {
        if (!this.tasks) {
            this.tasksService.tasksGlobalValue ? this.tasks = this.tasksService.tasksGlobalValue : this.getTasksFromServer();
        } else {
            this.tasks = this.FilterTasks(this.tasksService.tasksGlobalValue)
        }
    }

    getTasksFromServer(): void {
        this.tasksService.getUserTasks(this.params)
            .pipe(first())
            .subscribe({
                next: (tasksFromServer) => {
                    this.updateGlobalTasks(tasksFromServer)
                    // this.tasksService.updateGlobalTasks(tasksFromServer)
                    this.tasks = this.FilterTasks(tasksFromServer)
                }, error: error => {
                    this.alertService.error(error.message);
                }
            });
    }

    updateGlobalTasks(tasksFromServer: Task[]) {
        this.tasksService.updateGlobalTasks(tasksFromServer)
    }

    FilterTasks(tasks: Task[] | null) {
        let result = tasks?.filter((task: Task) => this.hideCompleted ? !task.completed : task)
        result = result?.slice(0, this.tasksLimit);
        return result;
    }


    toggleCompletedTasks() {
        if (this.hideCompleted) {
            this.tasks = this.FilterTasks(this.tasks);
        } else {
            this.tasks = this.FilterTasks(this.tasksService.tasksGlobalValue);
        }
    }

    changeTaskStatus(task: Task) {
        // dont send request to server so we wont get an error
        if (task.id > 200) {
            return
        }
        this.tasksService.updateTask(task)
            .pipe(first())
            .subscribe({
                next: () => {
                }, error: error => {
                    this.alertService.error(error.message);
                }
            });
    }


    deleteTask(taskId: string) {
        const task = this.tasks.find((task: Task) => task.id === taskId);
        if (task) {
            task.isDeleting = true;
        }
        this.tasksService.delete(taskId)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.handleDeleteTask(taskId)
                }, error: error => {
                    this.alertService.error(error.message);
                }
            });

    }
    handleDeleteTask(taskId: string) {
        this.tasks = this.tasks.filter((task: Task) => task.id !== taskId)
        this.updateGlobalTasks(this.tasks)
        this.alertService.success('Task succefully deleted');
    }

}