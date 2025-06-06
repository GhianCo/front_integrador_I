import {Injectable} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ComponentStore} from "@ngrx/component-store";
import {PARAM} from "@shared/constants";
import {Observable, of, throwError} from "rxjs";
import {catchError, map, switchMap, take, tap} from "rxjs/operators";
import {CustomersReq} from "./customers.req";
import {DateService} from "@shared/services/date.service";

export interface IStatesCustomersState {
    customersLoading: boolean,
    customersData: any[],
    customersPagination: any[],
    customersError: any,

    customerSelected: any,

    filterCustomersToApply: any,

    createUpdateCustomerLoading: boolean,
    createUpdateCustomerFlashMessage: string,
    createUpdateCustomerError: any,

    customersToCustomerLoading: boolean,
    customersToCustomerData: any[],
    customersToCustomerError: any,
}

const initialStatesCustomersState: IStatesCustomersState = {
    customersLoading: false,
    customersData: [],
    customersPagination: null,
    customersError: null,

    customerSelected: null,

    filterCustomersToApply: {
        query: PARAM.VACIO,
        page: 1,
        perPage: 10
    },

    createUpdateCustomerLoading: false,
    createUpdateCustomerFlashMessage: null,
    createUpdateCustomerError: null,

    customersToCustomerLoading: false,
    customersToCustomerData: [],
    customersToCustomerError: null,
};

@Injectable({ providedIn: 'root'})
export class CustomersComponentStore extends ComponentStore<IStatesCustomersState> {

    readonly filterCustomersToApply$: Observable<any> = this.select(({filterCustomersToApply}) => filterCustomersToApply);

    readonly customersLoading$: Observable<boolean> = this.select(({customersLoading}) => customersLoading);
    readonly customersData$: Observable<any[]> = this.select(({customersData}) => customersData);
    readonly customersPagination$: Observable<any> = this.select(({customersPagination}) => customersPagination);
    readonly customersError$: Observable<any> = this.select(({customersError}) => customersError);

    readonly customerSelected$: Observable<any> = this.select(({customerSelected}) => customerSelected);

    readonly createUpdateCustomerLoading$: Observable<boolean> = this.select(({createUpdateCustomerLoading}) => createUpdateCustomerLoading);
    readonly createUpdateCustomerFlashMessage$: Observable<string> = this.select(({createUpdateCustomerFlashMessage}) => createUpdateCustomerFlashMessage);
    readonly createUpdateCustomerError$: Observable<any> = this.select(({createUpdateCustomerError}) => createUpdateCustomerError);

    readonly customersToCustomerLoading$: Observable<boolean> = this.select(({customersToCustomerLoading}) => customersToCustomerLoading);
    readonly customersToCustomerData$: Observable<any[]> = this.select(({customersToCustomerData}) => customersToCustomerData);
    readonly customersToCustomerError$: Observable<string> = this.select(({customersToCustomerError}) => customersToCustomerError);


    constructor(
        private _customersRemoteRequest: CustomersReq,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
    ) {
        super(initialStatesCustomersState);
    }

    public get customerSelected() {
        const state = this.get();
        return state.customerSelected
    };

    public get customersData() {
        const state = this.get();
        return state.customersData
    };

    public get filterCustomersToApply() {
        const state = this.get();
        return state.filterCustomersToApply
    };

    readonly loadSearchCustomers = this.effect((filterCustomersToApply$: Observable<any>) => {
        return filterCustomersToApply$.pipe(
            tap(_ => {
                this.patchState({customersLoading: true});
            }),
            switchMap(criteria => this._customersRemoteRequest.requestSearchCustomersByCriteria(criteria).pipe(
                tap(async ({data, pagination}) => {
                    this.patchState({
                        customersLoading: false,
                        customersData: data,
                        customersPagination: pagination,
                    })
                }),
                catchError((error) => {
                    return of(this.patchState({
                        customersLoading: false,
                        customersError: error
                    }));
                }),
            )),
        );
    });

    readonly loadCreateCustomer = this.effect((customer$: Observable<any>) => {
        return customer$.pipe(
            map(customer => {
                this.patchState({createUpdateCustomerLoading: true});
                delete customer.customer_id;
                return {
                    ...customer,
                    active: customer.active ? PARAM.ACTIVO : PARAM.INACTIVO
                }
            }),
            switchMap(customer => this._customersRemoteRequest.requestCreateCustomer(customer).pipe(
                tap(async ({data, message}) => {
                    this.updateCustomerInList(data);
                    this.patchState({
                        createUpdateCustomerLoading: false,
                        customerSelected: data,
                        createUpdateCustomerFlashMessage: message,
                        createUpdateCustomerError: null
                    });
                    setTimeout(_ => {
                        this.patchState({
                            createUpdateCustomerFlashMessage: null
                        });
                    }, 3000);
                }),
                catchError((error) => {
                    return of(this.patchState({
                        createUpdateCustomerFlashMessage: error.error.message,
                        createUpdateCustomerLoading: false,
                        createUpdateCustomerError: error
                    }));
                }),
            )),
        );
    });

    readonly loadUpdateCustomer = this.effect((customer$: Observable<any>) => {
        return customer$.pipe(
            map(customer => {
                this.patchState({createUpdateCustomerLoading: true});
                return {
                    ...customer,
                    active: customer.active ? PARAM.ACTIVO : PARAM.INACTIVO
                }
            }),
            switchMap(customer => this._customersRemoteRequest.requestUpdateCustomer(customer).pipe(
                tap(async ({data, message}) => {
                    this.updateCustomerInList(data);
                    this.patchState({
                        createUpdateCustomerLoading: false,
                        customerSelected: data,
                        createUpdateCustomerFlashMessage: message
                    })
                    setTimeout(_ => {
                        this.patchState({
                            createUpdateCustomerFlashMessage: null
                        });
                    }, 3000);
                }),
                catchError((error) => {
                    return of(this.patchState({
                        createUpdateCustomerFlashMessage: error.error.message,
                        createUpdateCustomerLoading: false,
                        createUpdateCustomerError: error
                    }));
                }),
            )),
        );
    });

    public loadAllCustomers(): Observable<any> {
        this.loadSearchCustomers(this.filterCustomersToApply);
        return of(true);
    };

    public searchCustomerById(customerId): Observable<any> {
        return this.customersData$.pipe(
            take(1),
            map((customers) => {

                const customerSelected = customers.find(item => item.customer_id == customerId) || null;

                this.patchState({
                    customerSelected
                });

                return customerSelected;
            }),
            switchMap((stateFixedasset) => {

                if (!stateFixedasset) {
                    return throwError('No se encontro el customer con el id: ' + customerId + '!');
                }

                return of(stateFixedasset);
            })
        );
    };

    public addCustomer(): Observable<any> {
        const customersData: any[] = [...this.customersData];

        const customerSelected = {
            customer_id: null,
            name: null,
            description: null,
            active: true
        };

        customersData.unshift(customerSelected);

        this.patchState({
            customersData,
            customerSelected
        })
        return of(true);
    };

    readonly updateCustomerInList = this.updater((state, customerToUpdate: any) => {
        const customersData = [...state.customersData];
        const customerIndex = customersData.findIndex(customer => !customer.customer_id || customer.customer_id == customerToUpdate.customer_id);

        if (customerIndex >= 0) {
            customersData[customerIndex] = customerToUpdate;
        } else {
            customersData.push(customerToUpdate);
        }

        if(customerToUpdate.active == PARAM.INACTIVO) {
            customersData.splice(customerIndex, 1);
            this._router.navigate(['./tablas/mascotas'], { relativeTo: this._activatedRoute });
        }

        return {
            ...state,
            customersData
        }
    });

    readonly changePageInCustomers = this.updater((state, pagination: any) => {
        const filterCustomersToApply = {...state.filterCustomersToApply};
        filterCustomersToApply.page = pagination.pageIndex + 1;
        filterCustomersToApply.perPage = pagination.pageSize;
        this.loadSearchCustomers(filterCustomersToApply);
        return {
            ...state,
            filterCustomersToApply,
        }
    });

    readonly changeQueryInCustomers = this.updater((state, searchValue: string) => {
        const filterCustomersToApply: any = {...state.filterCustomersToApply};
        filterCustomersToApply.query = searchValue;
        filterCustomersToApply.page = 1;
        this.loadSearchCustomers(filterCustomersToApply);
        if (!searchValue.length) {
            filterCustomersToApply.query = PARAM.VACIO;
        }
        return {
            ...state,
            filterCustomersToApply,
        }
    });

    readonly discardFromListCustomerToCreate = this.updater((state) => {
        const customersDataStored: any[] = [...state.customersData];
        const customersData = customersDataStored.filter(customer => customer.customer_id > 0);
        return {
            ...state,
            customersData,
            customerSelected: null
        }
    });

    readonly cleanCustomerSelected = this.updater((state) => {
        return {
            ...state,
            customerSelected: null,
        }
    });

    readonly loadCustomersBySearch = this.effect((querySearch$: Observable<string>) => {
        return querySearch$.pipe(
            tap(_ => {
                this.patchState({customersToCustomerLoading: true});
            }),
            switchMap(querySearch => this._customersRemoteRequest.requestSearchCustomerToCustomerByQuery(querySearch).pipe(
                tap(async ({data}) => {
                    this.patchState({
                        customersToCustomerData: data,
                        customersToCustomerLoading: false,
                    })
                }),
                catchError((error) => {
                    return of(this.patchState({
                        customersToCustomerLoading: false,
                        customersToCustomerError: error
                    }));
                }),
            )),
        );
    });

    readonly clearCustomersToCustomerData = this.updater((state) => {
        return {
            ...state,
            customersToCustomerData: []
        }
    });

}
