import { Component } from '@angular/core';
import {
    trigger,
    transition,
    style,
    animate
} from '@angular/animations';
import { ToastService } from './toast.service';
import { Toast } from './toast.model';

@Component({
    selector: 'app-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss'],
    animations: [
        trigger('toastAnimation', [
            // 🔹 When toast enters
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateX(100%)'
                }),
                animate(
                    '250ms ease-out',
                    style({
                        opacity: 1,
                        transform: 'translateX(0)'
                    })
                )
            ]),

            // 🔹 When toast leaves
            transition(':leave', [
                animate(
                    '200ms ease-in',
                    style({
                        opacity: 0,
                        transform: 'translateX(100%)'
                    })
                )
            ])
        ])
    ]
})
export class ToastComponent {

    constructor(public toastService: ToastService) {}

    trackById(index: number, toast: Toast): number {
        return toast.id;
    }
}
