import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {OverlayRef} from '@angular/cdk/overlay';
import {MatDrawerToggleResult} from '@angular/material/sidenav';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ServicesListComponent} from '../services-list/services.list.component';
import {ServicesComponentStore} from "../../data-access/services.component.store";
import {AsyncPipe, NgIf} from "@angular/common";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatTooltip} from "@angular/material/tooltip";
import {RouterLink} from "@angular/router";
import {MatInput} from "@angular/material/input";
import {FlashMessageComponent} from "@shared/ui/flash-message/flash.message.component";
import {MatIcon} from "@angular/material/icon";
import {CanDeactivateServicesDetail} from "./service.detail.guard";

@Component({
    standalone: true,
    selector: 'services-detail',
    templateUrl: './service.detail.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        AsyncPipe,
        MatButton,
        MatIconButton,
        ReactiveFormsModule,
        MatFormField,
        MatSlideToggle,
        MatLabel,
        MatTooltip,
        RouterLink,
        MatInput,
        FlashMessageComponent,
        NgIf,
        MatIcon,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ServiceDetailComponent implements OnInit, OnDestroy {
    editMode: boolean = false;
    serviceForm: FormGroup;

    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    serviceSelected$ = this._servicesComponentStore.serviceSelected$;
    createUpdateServiceFlashMessage$ = this._servicesComponentStore.createUpdateServiceFlashMessage$;
    createUpdateServiceError$ = this._servicesComponentStore.createUpdateServiceError$;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _serviceListComponent: ServicesListComponent,
        private _formBuilder: FormBuilder,
        public _servicesComponentStore: ServicesComponentStore,
    ) {
    }

    ngOnInit(): void {
        this._serviceListComponent.matDrawer.open();
        this.serviceForm = this._formBuilder.group({
            service_id: [''],
            name: ['', [Validators.required]],
            description: ['', [Validators.required]],
            price: ['', [Validators.required]],
            active: [true]
        });
        this.serviceSelected$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((serviceSelected: any) => {
                    this._serviceListComponent.matDrawer.open();
                    if (serviceSelected?.service_id > 0) {
                        this.toggleEditMode(false);
                    } else {
                        this.toggleEditMode(true);
                    }
                    this.serviceForm.patchValue(serviceSelected);
                    this._changeDetectorRef.markForCheck();
                }
            );
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._serviceListComponent.matDrawer.close();
    }

    toggleEditMode(editMode: boolean | null = null) {
        if (editMode === null) {
            this.editMode = !this.editMode;
        } else {
            this.editMode = editMode;
        }

        this._changeDetectorRef.markForCheck();
    }

    createUpdateSelectedCompany(): void {
        if (this.serviceForm.invalid) {
            return;
        }
        const company = this.serviceForm.getRawValue();
        if (company.service_id) {
            this._servicesComponentStore.loadUpdateService(company);
        } else {
            this._servicesComponentStore.loadCreateService(company);
        }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(true);
        this._unsubscribeAll.complete();

        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }
    }
}
