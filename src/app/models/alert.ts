export class Alert {
    id: string | any;
    type: AlertType = AlertType.Error;
    message: string | any;
    autoClose: boolean = true;
    keepAfterRouteChange: boolean | any;
    fade: boolean | any;

    constructor(init?: Partial<Alert>) {
        Object.assign(this, init);
    }
}

export enum AlertType {
    Success,
    Error,

}
export enum AlertMessages {
    SUCCESS_ADD = "Task added successfully",
    SUCCESS_UPDATE = "Updated Task successfuly",
    ERROR_404 = "Status 404, sorry but we could not find what you are looking for",
    ERROR_500 = "Status 404, sorry but we could not find what you are looking for",
    ERROR_DEFAULT = "Status 404, sorry but we could not find what you are looking for"

}