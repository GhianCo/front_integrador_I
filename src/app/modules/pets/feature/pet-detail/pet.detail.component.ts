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
import {PetsListComponent} from '../pets-list/pets.list.component';
import {PetsComponentStore} from "../../data-access/pets.component.store";
import {AsyncPipe, CommonModule} from "@angular/common";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatTooltip} from "@angular/material/tooltip";
import {RouterLink} from "@angular/router";
import {MatInput} from "@angular/material/input";
import {FlashMessageComponent} from "@shared/ui/flash-message/flash.message.component";
import {MatIcon} from "@angular/material/icon";
import {MatOption, MatSelect} from "@angular/material/select";

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
            name: ['', [Validators.required]],
            especie: ['', [Validators.required]],
            breed: ['', [Validators.required]],
            birthdate: ['', [Validators.required]],
            gender: ['M', [Validators.required]],
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
