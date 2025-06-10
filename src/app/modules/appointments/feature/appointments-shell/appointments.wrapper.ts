import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
    standalone: true,
    selector: 'appointments',
    templateUrl: './appointments.wrapper.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        RouterOutlet
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsWrapper {
    constructor() {
    }
}
