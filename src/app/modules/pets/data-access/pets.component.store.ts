import {Injectable} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ComponentStore} from "@ngrx/component-store";
import {PARAM} from "@shared/constants";
import {Observable, of, throwError} from "rxjs";
import {catchError, map, switchMap, take, tap} from "rxjs/operators";
import {PetsReq} from "./pets.req";
import {DateService} from "@shared/services/date.service";

export interface IStatesPetsState {
    petsLoading: boolean,
    petsData: any[],
    petsPagination: any[],
    petsError: any,

    petSelected: any,

    filterPetsToApply: any,

    createUpdatePetLoading: boolean,
    createUpdatePetFlashMessage: string,
    createUpdatePetError: any,

    customersToPetLoading: boolean,
    customersToPetData: any[],
    customersToPetError: any,
}

const initialStatesPetsState: IStatesPetsState = {
    petsLoading: false,
    petsData: [],
    petsPagination: null,
    petsError: null,

    petSelected: null,

    filterPetsToApply: {
        query: PARAM.VACIO,
        page: 1,
        perPage: 10
    },

    createUpdatePetLoading: false,
    createUpdatePetFlashMessage: null,
    createUpdatePetError: null,

    customersToPetLoading: false,
    customersToPetData: [],
    customersToPetError: null,
};

@Injectable({ providedIn: 'root'})
export class PetsComponentStore extends ComponentStore<IStatesPetsState> {

    readonly filterPetsToApply$: Observable<any> = this.select(({filterPetsToApply}) => filterPetsToApply);

    readonly petsLoading$: Observable<boolean> = this.select(({petsLoading}) => petsLoading);
    readonly petsData$: Observable<any[]> = this.select(({petsData}) => petsData);
    readonly petsPagination$: Observable<any> = this.select(({petsPagination}) => petsPagination);
    readonly petsError$: Observable<any> = this.select(({petsError}) => petsError);

    readonly petSelected$: Observable<any> = this.select(({petSelected}) => petSelected);

    readonly createUpdatePetLoading$: Observable<boolean> = this.select(({createUpdatePetLoading}) => createUpdatePetLoading);
    readonly createUpdatePetFlashMessage$: Observable<string> = this.select(({createUpdatePetFlashMessage}) => createUpdatePetFlashMessage);
    readonly createUpdatePetError$: Observable<any> = this.select(({createUpdatePetError}) => createUpdatePetError);

    readonly customersToPetLoading$: Observable<boolean> = this.select(({customersToPetLoading}) => customersToPetLoading);
    readonly customersToPetData$: Observable<any[]> = this.select(({customersToPetData}) => customersToPetData);
    readonly customersToPetError$: Observable<string> = this.select(({customersToPetError}) => customersToPetError);


    constructor(
        private _petsRemoteRequest: PetsReq,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
    ) {
        super(initialStatesPetsState);
    }

    public get petSelected() {
        const state = this.get();
        return state.petSelected
    };

    public get petsData() {
        const state = this.get();
        return state.petsData
    };

    public get filterPetsToApply() {
        const state = this.get();
        return state.filterPetsToApply
    };

    readonly loadSearchPets = this.effect((filterPetsToApply$: Observable<any>) => {
        return filterPetsToApply$.pipe(
            tap(_ => {
                this.patchState({petsLoading: true});
            }),
            switchMap(criteria => this._petsRemoteRequest.requestSearchPetsByCriteria(criteria).pipe(
                tap(async ({data, pagination}) => {
                    this.patchState({
                        petsLoading: false,
                        petsData: data,
                        petsPagination: pagination,
                    })
                }),
                catchError((error) => {
                    return of(this.patchState({
                        petsLoading: false,
                        petsError: error
                    }));
                }),
            )),
        );
    });

    readonly loadCreatePet = this.effect((pet$: Observable<any>) => {
        return pet$.pipe(
            map(pet => {
                this.patchState({createUpdatePetLoading: true});
                delete pet.pet_id;
                return {
                    ...pet,
                    birthdate: DateService.formatDateForMySQL(pet.birthdate),
                    active: pet.active ? PARAM.ACTIVO : PARAM.INACTIVO
                }
            }),
            switchMap(pet => this._petsRemoteRequest.requestCreatePet(pet).pipe(
                tap(async ({data, message}) => {
                    this.updatePetInList(data);
                    this.patchState({
                        createUpdatePetLoading: false,
                        petSelected: data,
                        createUpdatePetFlashMessage: message,
                        createUpdatePetError: null
                    });
                    setTimeout(_ => {
                        this.patchState({
                            createUpdatePetFlashMessage: null
                        });
                    }, 3000);
                }),
                catchError((error) => {
                    return of(this.patchState({
                        createUpdatePetFlashMessage: error.error.message,
                        createUpdatePetLoading: false,
                        createUpdatePetError: error
                    }));
                }),
            )),
        );
    });

    readonly loadUpdatePet = this.effect((pet$: Observable<any>) => {
        return pet$.pipe(
            map(pet => {
                this.patchState({createUpdatePetLoading: true});
                return {
                    ...pet,
                    birthdate: DateService.formatDateForMySQL(pet.birthdate),
                    active: pet.active ? PARAM.ACTIVO : PARAM.INACTIVO
                }
            }),
            switchMap(pet => this._petsRemoteRequest.requestUpdatePet(pet).pipe(
                tap(async ({data, message}) => {
                    this.updatePetInList(data);
                    this.patchState({
                        createUpdatePetLoading: false,
                        petSelected: data,
                        createUpdatePetFlashMessage: message
                    })
                    setTimeout(_ => {
                        this.patchState({
                            createUpdatePetFlashMessage: null
                        });
                    }, 3000);
                }),
                catchError((error) => {
                    return of(this.patchState({
                        createUpdatePetFlashMessage: error.error.message,
                        createUpdatePetLoading: false,
                        createUpdatePetError: error
                    }));
                }),
            )),
        );
    });

    public loadAllPets(): Observable<any> {
        this.loadSearchPets(this.filterPetsToApply);
        return of(true);
    };

    public searchPetById(petId): Observable<any> {
        return this.petsData$.pipe(
            take(1),
            map((pets) => {

                const petSelected = pets.find(item => item.pet_id == petId) || null;

                this.patchState({
                    petSelected
                });

                return petSelected;
            }),
            switchMap((stateFixedasset) => {

                if (!stateFixedasset) {
                    return throwError('No se encontro el pet con el id: ' + petId + '!');
                }

                return of(stateFixedasset);
            })
        );
    };

    public addPet(): Observable<any> {
        const petsData: any[] = [...this.petsData];

        const petSelected = {
            pet_id: null,
            name: null,
            description: null,
            active: true
        };

        petsData.unshift(petSelected);

        this.patchState({
            petsData,
            petSelected
        })
        return of(true);
    };

    readonly updatePetInList = this.updater((state, petToUpdate: any) => {
        const petsData = [...state.petsData];
        const petIndex = petsData.findIndex(pet => !pet.pet_id || pet.pet_id == petToUpdate.pet_id);

        if (petIndex >= 0) {
            petsData[petIndex] = petToUpdate;
        } else {
            petsData.push(petToUpdate);
        }

        if(petToUpdate.active == PARAM.INACTIVO) {
            petsData.splice(petIndex, 1);
            this._router.navigate(['./tablas/mascotas'], { relativeTo: this._activatedRoute });
        }

        return {
            ...state,
            petsData
        }
    });

    readonly changePageInPets = this.updater((state, pagination: any) => {
        const filterPetsToApply = {...state.filterPetsToApply};
        filterPetsToApply.page = pagination.pageIndex + 1;
        filterPetsToApply.perPage = pagination.pageSize;
        this.loadSearchPets(filterPetsToApply);
        return {
            ...state,
            filterPetsToApply,
        }
    });

    readonly changeQueryInPets = this.updater((state, searchValue: string) => {
        const filterPetsToApply: any = {...state.filterPetsToApply};
        filterPetsToApply.query = searchValue;
        filterPetsToApply.page = 1;
        this.loadSearchPets(filterPetsToApply);
        if (!searchValue.length) {
            filterPetsToApply.query = PARAM.VACIO;
        }
        return {
            ...state,
            filterPetsToApply,
        }
    });

    readonly discardFromListPetToCreate = this.updater((state) => {
        const petsDataStored: any[] = [...state.petsData];
        const petsData = petsDataStored.filter(pet => pet.pet_id > 0);
        return {
            ...state,
            petsData,
            petSelected: null
        }
    });

    readonly cleanPetSelected = this.updater((state) => {
        return {
            ...state,
            petSelected: null,
        }
    });

    readonly loadCustomersBySearch = this.effect((querySearch$: Observable<string>) => {
        return querySearch$.pipe(
            tap(_ => {
                this.patchState({customersToPetLoading: true});
            }),
            switchMap(querySearch => this._petsRemoteRequest.requestSearchCustomerToPetByQuery(querySearch).pipe(
                tap(async ({data}) => {
                    this.patchState({
                        customersToPetData: data,
                        customersToPetLoading: false,
                    })
                }),
                catchError((error) => {
                    return of(this.patchState({
                        customersToPetLoading: false,
                        customersToPetError: error
                    }));
                }),
            )),
        );
    });

    readonly clearCustomersToPetData = this.updater((state) => {
        return {
            ...state,
            customersToPetData: []
        }
    });

}
