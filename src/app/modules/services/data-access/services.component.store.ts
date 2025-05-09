import {Injectable} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ComponentStore} from "@ngrx/component-store";
import {PARAM} from "@shared/constants";
import {Observable, of, throwError} from "rxjs";
import {catchError, map, switchMap, take, tap} from "rxjs/operators";
import {ServicesReq} from "./services.req";

export interface IStatesServicesState {
    servicesLoading: boolean,
    servicesData: any[],
    servicesPagination: any[],
    servicesError: any,

    serviceSelected: any,

    filterServicesToApply: any,

    createUpdateServiceLoading: boolean,
    createUpdateServiceFlashMessage: string,
    createUpdateServiceError: any,
}

const initialStatesServicesState: IStatesServicesState = {
    servicesLoading: false,
    servicesData: [],
    servicesPagination: null,
    servicesError: null,

    serviceSelected: null,

    filterServicesToApply: {
        query: PARAM.UNDEFINED,
        page: 1,
        perPage: 10
    },

    createUpdateServiceLoading: false,
    createUpdateServiceFlashMessage: null,
    createUpdateServiceError: null,
};

@Injectable({ providedIn: 'root'})
export class ServicesComponentStore extends ComponentStore<IStatesServicesState> {

    readonly filterServicesToApply$: Observable<any> = this.select(({filterServicesToApply}) => filterServicesToApply);

    readonly servicesLoading$: Observable<boolean> = this.select(({servicesLoading}) => servicesLoading);
    readonly servicesData$: Observable<any[]> = this.select(({servicesData}) => servicesData);
    readonly servicesPagination$: Observable<any> = this.select(({servicesPagination}) => servicesPagination);
    readonly servicesError$: Observable<any> = this.select(({servicesError}) => servicesError);

    readonly serviceSelected$: Observable<any> = this.select(({serviceSelected}) => serviceSelected);

    readonly createUpdateServiceLoading$: Observable<boolean> = this.select(({createUpdateServiceLoading}) => createUpdateServiceLoading);
    readonly createUpdateServiceFlashMessage$: Observable<string> = this.select(({createUpdateServiceFlashMessage}) => createUpdateServiceFlashMessage);
    readonly createUpdateServiceError$: Observable<any> = this.select(({createUpdateServiceError}) => createUpdateServiceError);

    constructor(
        private _statesFixedassetRemoteRequest: ServicesReq,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
    ) {
        super(initialStatesServicesState);
    }

    public get serviceSelected() {
        const state = this.get();
        return state.serviceSelected
    };

    public get servicesData() {
        const state = this.get();
        return state.servicesData
    };

    public get filterServicesToApply() {
        const state = this.get();
        return state.filterServicesToApply
    };

    readonly loadSearchServices = this.effect((filterServicesToApply$: Observable<any>) => {
        return filterServicesToApply$.pipe(
            tap(_ => {
                this.patchState({servicesLoading: true});
            }),
            switchMap(criteria => this._statesFixedassetRemoteRequest.requestSearchServicesByCriteria(criteria).pipe(
                tap(async ({data, pagination}) => {
                    this.patchState({
                        servicesLoading: false,
                        servicesData: data,
                        servicesPagination: pagination,
                    })
                }),
                catchError((error) => {
                    return of(this.patchState({
                        servicesLoading: false,
                        servicesError: error
                    }));
                }),
            )),
        );
    });

    readonly loadCreateService = this.effect((company$: Observable<any>) => {
        return company$.pipe(
            map(company => {
                this.patchState({createUpdateServiceLoading: true});
                return {
                    ...company,
                    service_activa: company.service_activa ? PARAM.ACTIVO : PARAM.INACTIVO
                }
            }),
            switchMap(company => this._statesFixedassetRemoteRequest.requestCreateService(company).pipe(
                tap(async ({data, message}) => {
                    this.updateServiceInList(data);
                    this.patchState({
                        createUpdateServiceLoading: false,
                        serviceSelected: data,
                        createUpdateServiceFlashMessage: message,
                        createUpdateServiceError: null
                    });

                    this._router.navigate(['services', data.service_id], {relativeTo: this._activatedRoute});

                    setTimeout(_ => {
                        this.patchState({
                            createUpdateServiceFlashMessage: null
                        });
                    }, 3000);
                }),
                catchError((error) => {
                    return of(this.patchState({
                        createUpdateServiceFlashMessage: error.error.message,
                        createUpdateServiceLoading: false,
                        createUpdateServiceError: error
                    }));
                }),
            )),
        );
    });

    readonly loadUpdateService = this.effect((company$: Observable<any>) => {
        return company$.pipe(
            map(company => {
                this.patchState({createUpdateServiceLoading: true});
                return {
                    ...company,
                    service_activa: company.service_activa ? PARAM.ACTIVO : PARAM.INACTIVO
                }
            }),
            switchMap(company => this._statesFixedassetRemoteRequest.requestUpdateService(company).pipe(
                tap(async ({data, message}) => {
                    this.updateServiceInList(data);
                    this.patchState({
                        createUpdateServiceLoading: false,
                        serviceSelected: data,
                        createUpdateServiceFlashMessage: message
                    })
                    setTimeout(_ => {
                        this.patchState({
                            createUpdateServiceFlashMessage: null
                        });
                    }, 3000);
                }),
                catchError((error) => {
                    return of(this.patchState({
                        createUpdateServiceFlashMessage: error.error.message,
                        createUpdateServiceLoading: false,
                        createUpdateServiceError: error
                    }));
                }),
            )),
        );
    });

    public loadAllServices(): Observable<any> {
        this.loadSearchServices(this.filterServicesToApply);
        return of(true);
    };

    public searchServiceById(serviceId): Observable<any> {
        return this.servicesData$.pipe(
            take(1),
            map((services) => {

                const serviceSelected = services.find(item => item.service_id == serviceId) || null;

                this.patchState({
                    serviceSelected
                });

                return serviceSelected;
            }),
            switchMap((stateFixedasset) => {

                if (!stateFixedasset) {
                    return throwError('No se encontro el service con el id: ' + serviceId + '!');
                }

                return of(stateFixedasset);
            })
        );
    };

    public addService(): Observable<any> {
        const servicesData: any[] = [...this.servicesData];

        const serviceSelected = {
            service_id: null,
            service_nombre: null,
            service_activa: true
        };

        servicesData.unshift(serviceSelected);

        this.patchState({
            servicesData,
            serviceSelected
        })
        return of(true);
    };

    readonly updateServiceInList = this.updater((state, companyToUpdate: any) => {
        const servicesData = [...state.servicesData];
        const companyIndex = servicesData.findIndex(company => !company.service_id || company.service_id == companyToUpdate.service_id);

        if (companyIndex >= 0) {
            servicesData[companyIndex] = companyToUpdate;
        }

        return {
            ...state,
            servicesData
        }
    });

    readonly changePageInServices = this.updater((state, pagination: any) => {
        const filterServicesToApply = {...state.filterServicesToApply};
        filterServicesToApply.page = pagination.pageIndex + 1;
        filterServicesToApply.perPage = pagination.pageSize;
        this.loadSearchServices(filterServicesToApply);
        return {
            ...state,
            filterServicesToApply,
        }
    });

    readonly changeQueryInServices = this.updater((state, searchValue: string) => {
        const filterServicesToApply: any = {...state.filterServicesToApply};
        filterServicesToApply.query = searchValue;
        filterServicesToApply.page = 1;
        this.loadSearchServices(filterServicesToApply);
        if (!searchValue.length) {
            filterServicesToApply.query = PARAM.UNDEFINED;
        }
        return {
            ...state,
            filterServicesToApply,
        }
    });

    readonly discardFromListServiceToCreate = this.updater((state) => {
        const servicesDataStored: any[] = [...state.servicesData];
        const servicesData = servicesDataStored.filter(company => company.service_id > 0);
        return {
            ...state,
            servicesData,
            serviceSelected: null
        }
    });

    readonly cleanServiceSelected = this.updater((state) => {
        return {
            ...state,
            serviceSelected: null,
        }
    });

}
