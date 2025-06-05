import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
    standalone: true,
    selector: 'pets',
    templateUrl: './pets.wrapper.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        RouterOutlet
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetsWrapper {
    constructor() {
    }
}
