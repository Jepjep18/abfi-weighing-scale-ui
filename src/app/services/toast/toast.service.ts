import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast, ToastType } from './toast.model';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    private _toasts = new BehaviorSubject<Toast[]>([]);
    toasts$ = this._toasts.asObservable();

    private _counter = 0;

    show(
        message: string,
        type: ToastType = 'info',
        duration = 3000
    ): void {
        const toast: Toast = {
            id: ++this._counter,
            message,
            type,
            duration
        };

        this._toasts.next([...this._toasts.value, toast]);

        setTimeout(() => this.remove(toast.id), duration);
    }

    success(message: string): void {
        this.show(message, 'success');
    }

    error(message: string): void {
        this.show(message, 'error', 5000);
    }

    info(message: string): void {
        this.show(message, 'info');
    }

    warning(message: string): void {
        this.show(message, 'warning');
    }

    remove(id: number): void {
        this._toasts.next(
            this._toasts.value.filter(t => t.id !== id)
        );
    }
}
