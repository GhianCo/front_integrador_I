import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {CustomersComponentStore} from "../../data-access/customers.component.store";

@Injectable({ providedIn: 'root'})
export class CustomerDetailResolver implements Resolve<any>
{
    constructor(
        private _servicesComponentStore: CustomersComponentStore,
        private _router: Router

    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._servicesComponentStore.searchCustomerById(route.paramMap.get('id')).pipe(
            catchError((error) => {
                console.error(error);
                const parentUrl = state.url.split('/').slice(0, -1).join('/');
                this._router.navigateByUrl(parentUrl);
                return throwError(error);
            })
        );
    }
}
