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
import {PetsListComponent} from '../pets-list/pets.list.component';
import {PetsComponentStore} from "../../data-access/pets.component.store";
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
    selector: 'pets-detail',
    templateUrl: './pet.detail.component.html',
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

export class PetDetailComponent implements OnInit, OnDestroy {
    editMode: boolean = false;
    petForm: FormGroup;

    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    petSelected$ = this._petsComponentStore.petSelected$;
    createUpdatePetFlashMessage$ = this._petsComponentStore.createUpdatePetFlashMessage$;
    createUpdatePetError$ = this._petsComponentStore.createUpdatePetError$;

    public customersToPetData$ = this._petsComponentStore.customersToPetData$;

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
        private _petListComponent: PetsListComponent,
        private _formBuilder: FormBuilder,
        public _petsComponentStore: PetsComponentStore,
    ) {
    }

    ngOnInit(): void {
        this._petListComponent.matDrawer.open();
        this.petForm = this._formBuilder.group({
            pet_id: [''],
            customer_fullname: ['', Validators.required],
            customer_id: ['', Validators.required],
            name: ['', Validators.required],
            especie: ['', Validators.required],
            breed: ['', Validators.required],
            birthdate: ['', Validators.required],
            gender: ['M', Validators.required],
            active: [true]
        });
        this.petSelected$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((petSelected: any) => {
                    this._petListComponent.matDrawer.open();
                    if (petSelected?.pet_id > 0) {
                        this.toggleEditMode(false);
                    } else {
                        this.toggleEditMode(true);
                    }
                    this.petForm.patchValue(petSelected);
                    this._changeDetectorRef.markForCheck();
                }
            );
        this.searchCustomerToAssignChanged.pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(800),
            tap(searchValue => {
                this._petsComponentStore.loadCustomersBySearch(searchValue);
            })
        ).subscribe();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._petListComponent.matDrawer.close();
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
        if (this.petForm.invalid) {
            return;
        }
        const pet = this.petForm.getRawValue();
        if (pet.pet_id) {
            this._petsComponentStore.loadUpdatePet(pet);
        } else {
            this._petsComponentStore.loadCreatePet(pet);
        }
    }

    public searchCustomerByQueryToPet(searchValue) {
        this.searchCustomerToAssignChanged.next(searchValue);
    }

    public assignCustomerToPet(customer) {
        this.petForm.patchValue({
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
