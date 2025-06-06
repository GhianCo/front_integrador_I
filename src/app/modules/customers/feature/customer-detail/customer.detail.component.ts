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
import {debounceTime, Subject, tap} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CustomersComponentStore} from "../../data-access/customers.component.store";
import {AsyncPipe, CommonModule} from "@angular/common";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatTooltip} from "@angular/material/tooltip";
import {RouterLink} from "@angular/router";
import {MatInput} from "@angular/material/input";
import {FlashMessageComponent} from "@shared/ui/flash-message/flash.message.component";
import {MatIcon} from "@angular/material/icon";
import {MatOption, MatSelect} from "@angular/material/select";
import {
    MatDatepickerModule,
} from "@angular/material/datepicker";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {MomentDateAdapter} from "@angular/material-moment-adapter";
import {SelectSearchingComponent} from "@shared/ui/select-searching/select.searching.component";
import {CustomersListComponent} from "../customers-list/customers.list.component";

export const MY_FORMATS = {
    parse: {
        dateInput: 'LL'
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY'
    }
};

@Component({
    standalone: true,
    selector: 'customers-detail',
    templateUrl: './customer.detail.component.html',
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
        CommonModule,
        MatIcon,
        MatSelect,
        MatOption,
        MatFormFieldModule,
        MatDatepickerModule,
        SelectSearchingComponent
    ],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CustomerDetailComponent implements OnInit, OnDestroy {
    editMode: boolean = false;
    customerForm: FormGroup;

    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    customerSelected$ = this._customersComponentStore.customerSelected$;
    createUpdateCustomerFlashMessage$ = this._customersComponentStore.createUpdateCustomerFlashMessage$;
    createUpdateCustomerError$ = this._customersComponentStore.createUpdateCustomerError$;

    public customersToCustomerData$ = this._customersComponentStore.customersToCustomerData$;

    private searchCustomerToAssignChanged: Subject<string> = new Subject<string>();
    public formSubmitted = false;

    public especies: any = [
        {
            id: 'Perro',
            value: 'Perro'
        },
        {
            id: 'Gato',
            value: 'Gato'
        },
        {
            id: 'Conejo',
            value: 'Conejo'
        },
        {
            id: 'Hámster',
            value: 'Hámster'
        },
        {
            id: 'Loro',
            value: 'Loro'
        }
    ]

    public sexos: any = [
        {
            id: 'M',
            value: 'Macho'
        },
        {
            id: 'H',
            value: 'Hembra'
        }
    ]

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _customerListComponent: CustomersListComponent,
        private _formBuilder: FormBuilder,
        public _customersComponentStore: CustomersComponentStore,
    ) {
    }

    ngOnInit(): void {
        this._customerListComponent.matDrawer.open();
        this.customerForm = this._formBuilder.group({
            customer_id: [''],
            name: ['', Validators.required],
            lastname: ['', Validators.required],
            dni: ['', Validators.required],
            email: ['', Validators.required],
            phone: ['', Validators.required],
            address: [''],
            active: [true]
        });
        this.customerSelected$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((customerSelected: any) => {
                    this._customerListComponent.matDrawer.open();
                    if (customerSelected?.customer_id > 0) {
                        this.toggleEditMode(false);
                    } else {
                        this.toggleEditMode(true);
                    }
                    this.customerForm.patchValue(customerSelected);
                    this._changeDetectorRef.markForCheck();
                }
            );
        this.searchCustomerToAssignChanged.pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(800),
            tap(searchValue => {
                this._customersComponentStore.loadCustomersBySearch(searchValue);
            })
        ).subscribe();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._customerListComponent.matDrawer.close();
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
        this.formSubmitted = true;
        if (this.customerForm.invalid) {
            return;
        }
        const customer = this.customerForm.getRawValue();
        if (customer.customer_id) {
            this._customersComponentStore.loadUpdateCustomer(customer);
        } else {
            this._customersComponentStore.loadCreateCustomer(customer);
        }
    }

    public searchCustomerByQueryToCustomer(searchValue) {
        this.searchCustomerToAssignChanged.next(searchValue);
    }

    public assignCustomerToCustomer(customer) {
        this.customerForm.patchValue({
            customer_id: customer.customer_id,
            customer_fullname: customer.customer_fullname
        });
        this._changeDetectorRef.markForCheck();
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
