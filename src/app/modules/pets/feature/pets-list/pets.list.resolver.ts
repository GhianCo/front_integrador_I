import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {PetsComponentStore} from "../../data-access/pets.component.store";

@Injectable({ providedIn: 'root'})
export class PetsListResolver implements Resolve<any> {
    constructor(
        private _servicesComponentStore: PetsComponentStore,
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._servicesComponentStore.loadAllPets();
    }
}
