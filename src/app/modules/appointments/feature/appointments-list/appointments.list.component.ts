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
import {AppointmentsComponentStore} from "../../data-access/appointments.component.store";
import {MatIcon} from "@angular/material/icon";
import {FuseMediaWatcherService} from "@fuse/services/media-watcher";

@Component({
    standalone: true,
    selector: 'appointments-list',
    templateUrl: './appointments.list.component.html',
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

export class AppointmentsListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    countries: any[];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedStateFixedasset: any;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    private searchAppointmentsChanged: Subject<string> = new Subject<string>();

    filterAppointmentsToApply$ = this._appointmentsComponentStoreo.filterAppointmentsToApply$;
    appointmentsLoading$ = this._appointmentsComponentStoreo.appointmentsLoading$;
    appointmentsData$ = this._appointmentsComponentStoreo.appointmentsData$;
    appointmentsPagination$ = this._appointmentsComponentStoreo.appointmentsPagination$;

    appointmentSelected$ = this._appointmentsComponentStoreo.appointmentSelected$;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _mediaWatcherAppointment: FuseMediaWatcherService,
        public _appointmentsComponentStoreo: AppointmentsComponentStore,
    ) {
    }

    ngOnInit(): void {
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                this.selectedStateFixedasset = null;

                this._changeDetectorRef.markForCheck();
            }
        });

        this._mediaWatcherAppointment.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                } else {
                    this.drawerMode = 'over';
                }

                this._changeDetectorRef.markForCheck();
            });
        this.searchAppointmentsChanged.pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(800),
            tap(searchValue => {
                this._appointmentsComponentStoreo.changeQueryInAppointments(searchValue);
            })
        ).subscribe();
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        this._changeDetectorRef.markForCheck();
    }

    public searchAppointmentsByQuery(searchValue: string) {
        this.searchAppointmentsChanged.next(searchValue);
    }

    public changePagination(event: any) {
        this._appointmentsComponentStoreo.changePageInAppointments(event);
    }

    public loadAllAppointments() {
        this._appointmentsComponentStoreo.loadAllAppointments();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(true);
        this._unsubscribeAll.complete();
    }
}
