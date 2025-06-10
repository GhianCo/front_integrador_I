import {Injectable} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ComponentStore} from "@ngrx/component-store";
import {PARAM} from "@shared/constants";
import {Observable, of, throwError} from "rxjs";
import {catchError, map, switchMap, take, tap} from "rxjs/operators";
import {AppointmentsReq} from "./appointments.req";
import {DateService} from "@shared/services/date.service";

export interface IStatesAppointmentsState {
    appointmentsLoading: boolean,
    appointmentsData: any[],
    appointmentsPagination: any[],
    appointmentsError: any,

    appointmentSelected: any,

    filterAppointmentsToApply: any,

    createUpdateAppointmentLoading: boolean,
    createUpdateAppointmentFlashMessage: string,
    createUpdateAppointmentError: any,

    customersToAppointmentLoading: boolean,
    customersToAppointmentData: any[],
    customersToAppointmentError: any,
}

const initialStatesAppointmentsState: IStatesAppointmentsState = {
    appointmentsLoading: false,
    appointmentsData: [],
    appointmentsPagination: null,
    appointmentsError: null,

    appointmentSelected: null,

    filterAppointmentsToApply: {
        query: PARAM.VACIO,
        page: 1,
        perPage: 10
    },

    createUpdateAppointmentLoading: false,
    createUpdateAppointmentFlashMessage: null,
    createUpdateAppointmentError: null,

    customersToAppointmentLoading: false,
    customersToAppointmentData: [],
    customersToAppointmentError: null,
};

@Injectable({ providedIn: 'root'})
export class AppointmentsComponentStore extends ComponentStore<IStatesAppointmentsState> {

    readonly filterAppointmentsToApply$: Observable<any> = this.select(({filterAppointmentsToApply}) => filterAppointmentsToApply);

    readonly appointmentsLoading$: Observable<boolean> = this.select(({appointmentsLoading}) => appointmentsLoading);
    readonly appointmentsData$: Observable<any[]> = this.select(({appointmentsData}) => appointmentsData);
    readonly appointmentsPagination$: Observable<any> = this.select(({appointmentsPagination}) => appointmentsPagination);
    readonly appointmentsError$: Observable<any> = this.select(({appointmentsError}) => appointmentsError);

    readonly appointmentSelected$: Observable<any> = this.select(({appointmentSelected}) => appointmentSelected);

    readonly createUpdateAppointmentLoading$: Observable<boolean> = this.select(({createUpdateAppointmentLoading}) => createUpdateAppointmentLoading);
    readonly createUpdateAppointmentFlashMessage$: Observable<string> = this.select(({createUpdateAppointmentFlashMessage}) => createUpdateAppointmentFlashMessage);
    readonly createUpdateAppointmentError$: Observable<any> = this.select(({createUpdateAppointmentError}) => createUpdateAppointmentError);

    readonly customersToAppointmentLoading$: Observable<boolean> = this.select(({customersToAppointmentLoading}) => customersToAppointmentLoading);
    readonly customersToAppointmentData$: Observable<any[]> = this.select(({customersToAppointmentData}) => customersToAppointmentData);
    readonly customersToAppointmentError$: Observable<string> = this.select(({customersToAppointmentError}) => customersToAppointmentError);


    constructor(
        private _appointmentsRemoteRequest: AppointmentsReq,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
    ) {
        super(initialStatesAppointmentsState);
    }

    public get appointmentSelected() {
        const state = this.get();
        return state.appointmentSelected
    };

    public get appointmentsData() {
        const state = this.get();
        return state.appointmentsData
    };

    public get filterAppointmentsToApply() {
        const state = this.get();
        return state.filterAppointmentsToApply
    };

    readonly loadSearchAppointments = this.effect((filterAppointmentsToApply$: Observable<any>) => {
        return filterAppointmentsToApply$.pipe(
            tap(_ => {
                this.patchState({appointmentsLoading: true});
            }),
            switchMap(criteria => this._appointmentsRemoteRequest.requestSearchAppointmentsByCriteria(criteria).pipe(
                tap(async ({data, pagination}) => {
                    this.patchState({
                        appointmentsLoading: false,
                        appointmentsData: data,
                        appointmentsPagination: pagination,
                    })
                }),
                catchError((error) => {
                    return of(this.patchState({
                        appointmentsLoading: false,
                        appointmentsError: error
                    }));
                }),
            )),
        );
    });

    readonly loadCreateAppointment = this.effect((appointment$: Observable<any>) => {
        return appointment$.pipe(
            map(appointment => {
                this.patchState({createUpdateAppointmentLoading: true});
                delete appointment.appointment_id;
                return {
                    ...appointment,
                    birthdate: DateService.formatDateForMySQL(appointment.birthdate),
                    active: appointment.active ? PARAM.ACTIVO : PARAM.INACTIVO
                }
            }),
            switchMap(appointment => this._appointmentsRemoteRequest.requestCreateAppointment(appointment).pipe(
                tap(async ({data, message}) => {
                    this.updateAppointmentInList(data);
                    this.patchState({
                        createUpdateAppointmentLoading: false,
                        appointmentSelected: data,
                        createUpdateAppointmentFlashMessage: message,
                        createUpdateAppointmentError: null
                    });
                    setTimeout(_ => {
                        this.patchState({
                            createUpdateAppointmentFlashMessage: null
                        });
                    }, 3000);
                }),
                catchError((error) => {
                    return of(this.patchState({
                        createUpdateAppointmentFlashMessage: error.error.message,
                        createUpdateAppointmentLoading: false,
                        createUpdateAppointmentError: error
                    }));
                }),
            )),
        );
    });

    readonly loadUpdateAppointment = this.effect((appointment$: Observable<any>) => {
        return appointment$.pipe(
            map(appointment => {
                this.patchState({createUpdateAppointmentLoading: true});
                return {
                    ...appointment,
                    birthdate: DateService.formatDateForMySQL(appointment.birthdate),
                    active: appointment.active ? PARAM.ACTIVO : PARAM.INACTIVO
                }
            }),
            switchMap(appointment => this._appointmentsRemoteRequest.requestUpdateAppointment(appointment).pipe(
                tap(async ({data, message}) => {
                    this.updateAppointmentInList(data);
                    this.patchState({
                        createUpdateAppointmentLoading: false,
                        appointmentSelected: data,
                        createUpdateAppointmentFlashMessage: message
                    })
                    setTimeout(_ => {
                        this.patchState({
                            createUpdateAppointmentFlashMessage: null
                        });
                    }, 3000);
                }),
                catchError((error) => {
                    return of(this.patchState({
                        createUpdateAppointmentFlashMessage: error.error.message,
                        createUpdateAppointmentLoading: false,
                        createUpdateAppointmentError: error
                    }));
                }),
            )),
        );
    });

    public loadAllAppointments(): Observable<any> {
        this.loadSearchAppointments(this.filterAppointmentsToApply);
        return of(true);
    };

    public searchAppointmentById(appointmentId): Observable<any> {
        return this.appointmentsData$.pipe(
            take(1),
            map((appointments) => {

                const appointmentSelected = appointments.find(item => item.appointment_id == appointmentId) || null;

                this.patchState({
                    appointmentSelected
                });

                return appointmentSelected;
            }),
            switchMap((stateFixedasset) => {

                if (!stateFixedasset) {
                    return throwError('No se encontro el appointment con el id: ' + appointmentId + '!');
                }

                return of(stateFixedasset);
            })
        );
    };

    public addAppointment(): Observable<any> {
        const appointmentsData: any[] = [...this.appointmentsData];

        const appointmentSelected = {
            appointment_id: null,
            name: null,
            description: null,
            active: true
        };

        appointmentsData.unshift(appointmentSelected);

        this.patchState({
            appointmentsData,
            appointmentSelected
        })
        return of(true);
    };

    readonly updateAppointmentInList = this.updater((state, appointmentToUpdate: any) => {
        const appointmentsData = [...state.appointmentsData];
        const appointmentIndex = appointmentsData.findIndex(appointment => !appointment.appointment_id || appointment.appointment_id == appointmentToUpdate.appointment_id);

        if (appointmentIndex >= 0) {
            appointmentsData[appointmentIndex] = appointmentToUpdate;
        } else {
            appointmentsData.push(appointmentToUpdate);
        }

        if(appointmentToUpdate.active == PARAM.INACTIVO) {
            appointmentsData.splice(appointmentIndex, 1);
            this._router.navigate(['./tablas/mascotas'], { relativeTo: this._activatedRoute });
        }

        return {
            ...state,
            appointmentsData
        }
    });

    readonly changePageInAppointments = this.updater((state, pagination: any) => {
        const filterAppointmentsToApply = {...state.filterAppointmentsToApply};
        filterAppointmentsToApply.page = pagination.pageIndex + 1;
        filterAppointmentsToApply.perPage = pagination.pageSize;
        this.loadSearchAppointments(filterAppointmentsToApply);
        return {
            ...state,
            filterAppointmentsToApply,
        }
    });

    readonly changeQueryInAppointments = this.updater((state, searchValue: string) => {
        const filterAppointmentsToApply: any = {...state.filterAppointmentsToApply};
        filterAppointmentsToApply.query = searchValue;
        filterAppointmentsToApply.page = 1;
        this.loadSearchAppointments(filterAppointmentsToApply);
        if (!searchValue.length) {
            filterAppointmentsToApply.query = PARAM.VACIO;
        }
        return {
            ...state,
            filterAppointmentsToApply,
        }
    });

    readonly discardFromListAppointmentToCreate = this.updater((state) => {
        const appointmentsDataStored: any[] = [...state.appointmentsData];
        const appointmentsData = appointmentsDataStored.filter(appointment => appointment.appointment_id > 0);
        return {
            ...state,
            appointmentsData,
            appointmentSelected: null
        }
    });

    readonly cleanAppointmentSelected = this.updater((state) => {
        return {
            ...state,
            appointmentSelected: null,
        }
    });

    readonly loadCustomersBySearch = this.effect((querySearch$: Observable<string>) => {
        return querySearch$.pipe(
            tap(_ => {
                this.patchState({customersToAppointmentLoading: true});
            }),
            switchMap(querySearch => this._appointmentsRemoteRequest.requestSearchCustomerToAppointmentByQuery(querySearch).pipe(
                tap(async ({data}) => {
                    this.patchState({
                        customersToAppointmentData: data,
                        customersToAppointmentLoading: false,
                    })
                }),
                catchError((error) => {
                    return of(this.patchState({
                        customersToAppointmentLoading: false,
                        customersToAppointmentError: error
                    }));
                }),
            )),
        );
    });

    readonly clearCustomersToAppointmentData = this.updater((state) => {
        return {
            ...state,
            customersToAppointmentData: []
        }
    });

}
