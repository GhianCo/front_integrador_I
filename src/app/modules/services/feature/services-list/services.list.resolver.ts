import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {ServicesComponentStore} from "../../data-access/services.component.store";

@Injectable({ providedIn: 'root'})
export class ServicesListResolver implements Resolve<any> {
    constructor(
        private _servicesComponentStore: ServicesComponentStore,
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._servicesComponentStore.loadAllServices();
    }
}
