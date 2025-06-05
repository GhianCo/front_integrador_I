import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {AsyncPipe, DOCUMENT, I18nPluralPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute, Router, RouterLink, RouterOutlet} from '@angular/router';
import {FormControl} from '@angular/forms';
import {MatDrawer, MatDrawerContainer, MatDrawerContent} from '@angular/material/sidenav';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil, tap} from 'rxjs/operators';
import {MatFormField} from "@angular/material/form-field";
import {MatPaginator} from "@angular/material/paginator";
import {MatAnchor, MatButton} from "@angular/material/button";
import {LeadIconComponent} from "@shared/ui/lead-icon/lead.icon.component";
import {MatInput} from "@angular/material/input";
import {PetsComponentStore} from "../../data-access/pets.component.store";
import {MatIcon} from "@angular/material/icon";
import {FuseMediaWatcherService} from "@fuse/services/media-watcher";

@Component({
    standalone: true,
    selector: 'pets-list',
    templateUrl: './pets.list.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatDrawerContent,
        MatDrawerContainer,
        RouterOutlet,
        MatDrawer,
        MatFormField,
        MatPaginator,
        RouterLink,
        NgClass,
        MatButton,
        I18nPluralPipe,
        NgIf,
        LeadIconComponent,
        MatInput,
        MatAnchor,
        AsyncPipe,
        MatIcon,
        NgForOf
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PetsListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    countries: any[];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedStateFixedasset: any;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    private searchPetsChanged: Subject<string> = new Subject<string>();

    filterPetsToApply$ = this._petsComponentStoreo.filterPetsToApply$;
    petsLoading$ = this._petsComponentStoreo.petsLoading$;
    petsData$ = this._petsComponentStoreo.petsData$;
    petsPagination$ = this._petsComponentStoreo.petsPagination$;

    petSelected$ = this._petsComponentStoreo.petSelected$;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _mediaWatcherPet: FuseMediaWatcherService,
        public _petsComponentStoreo: PetsComponentStore,
    ) {
    }

    ngOnInit(): void {
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                this.selectedStateFixedasset = null;

                this._changeDetectorRef.markForCheck();
            }
        });

        this._mediaWatcherPet.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                } else {
                    this.drawerMode = 'over';
                }

                this._changeDetectorRef.markForCheck();
            });
        this.searchPetsChanged.pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(800),
            tap(searchValue => {
                this._petsComponentStoreo.changeQueryInPets(searchValue);
            })
        ).subscribe();
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        this._changeDetectorRef.markForCheck();
    }

    public searchPetsByQuery(searchValue: string) {
        this.searchPetsChanged.next(searchValue);
    }

    public changePagination(event: any) {
        this._petsComponentStoreo.changePageInPets(event);
    }

    public loadAllPets() {
        this._petsComponentStoreo.loadAllPets();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(true);
        this._unsubscribeAll.complete();
    }
}
