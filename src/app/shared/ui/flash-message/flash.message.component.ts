import {Component, Input, OnInit} from '@angular/core';
import {NgClass} from "@angular/common";
import {MatIcon} from "@angular/material/icon";

@Component({
    standalone: true,
    selector: 'app-flash-message',
    templateUrl: './flash.message.component.html',
    imports: [
        NgClass,
        MatIcon
    ]
})

export class FlashMessageComponent implements OnInit {

    @Input() hasError: boolean = false;
    @Input() message: string = '';

    constructor() {
    }

    ngOnInit() {
    }

}
