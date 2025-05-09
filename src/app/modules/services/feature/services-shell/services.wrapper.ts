import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {CanDeactivateServicesDetail} from "../service-detail/service.detail.guard";

@Component({
    standalone: true,
    selector: 'services',
    templateUrl: './services.wrapper.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        RouterOutlet
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesWrapper {
    constructor() {
    }
}
