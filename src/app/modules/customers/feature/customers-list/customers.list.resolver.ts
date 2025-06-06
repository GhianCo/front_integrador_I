import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {CustomersComponentStore} from "../../data-access/customers.component.store";

@Injectable({ providedIn: 'root'})
export class CustomersListResolver implements Resolve<any> {
    constructor(
        private _servicesComponentStore: CustomersComponentStore,
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._servicesComponentStore.loadAllCustomers();
    }
}
