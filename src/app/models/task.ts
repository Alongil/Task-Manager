export interface Task {
    userId?: number;
    id: string | number;
    title: string;
    completed: boolean;
    isDeleting?: boolean
}


