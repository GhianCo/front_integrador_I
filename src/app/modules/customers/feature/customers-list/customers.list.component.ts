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
import {CustomersComponentStore} from "../../data-access/customers.component.store";
import {MatIcon} from "@angular/material/icon";
import {FuseMediaWatcherService} from "@fuse/services/media-watcher";

@Component({
    standalone: true,
    selector: 'customers-list',
    templateUrl: './customers.list.component.html',
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

export class CustomersListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    countries: any[];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedStateFixedasset: any;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    private searchCustomersChanged: Subject<string> = new Subject<string>();

    filterCustomersToApply$ = this._customersComponentStoreo.filterCustomersToApply$;
    customersLoading$ = this._customersComponentStoreo.customersLoading$;
    customersData$ = this._customersComponentStoreo.customersData$;
    customersPagination$ = this._customersComponentStoreo.customersPagination$;

    customerSelected$ = this._customersComponentStoreo.customerSelected$;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _mediaWatcherCustomer: FuseMediaWatcherService,
        public _customersComponentStoreo: CustomersComponentStore,
    ) {
    }

    ngOnInit(): void {
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                this.selectedStateFixedasset = null;

                this._changeDetectorRef.markForCheck();
            }
        });

        this._mediaWatcherCustomer.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                } else {
                    this.drawerMode = 'over';
                }

                this._changeDetectorRef.markForCheck();
            });
        this.searchCustomersChanged.pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(800),
            tap(searchValue => {
                this._customersComponentStoreo.changeQueryInCustomers(searchValue);
            })
        ).subscribe();
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        this._changeDetectorRef.markForCheck();
    }

    public searchCustomersByQuery(searchValue: string) {
        this.searchCustomersChanged.next(searchValue);
    }

    public changePagination(event: any) {
        this._customersComponentStoreo.changePageInCustomers(event);
    }

    public loadAllCustomers() {
        this._customersComponentStoreo.loadAllCustomers();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(true);
        this._unsubscribeAll.complete();
    }
}
