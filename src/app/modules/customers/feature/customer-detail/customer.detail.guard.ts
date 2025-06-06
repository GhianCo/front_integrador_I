import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CustomerDetailComponent } from './customer.detail.component';
import {CustomersComponentStore} from "../../data-access/customers.component.store";

@Injectable({ providedIn: 'root'})
export class CanDeactivateCustomersDetail implements CanDeactivate<CustomerDetailComponent>
{
    constructor(
        private _customersComponentStore: CustomersComponentStore,

    ) {
    }
    canDeactivate(
        component: CustomerDetailComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        let nextRoute: ActivatedRouteSnapshot = nextState.root;
        while ( nextRoute.firstChild )
        {
            nextRoute = nextRoute.firstChild;
        }

        if ( !nextState.url.includes('/clientes') )
        {
            return true;
        }

        if ( nextRoute.paramMap.get('id'))
        {
            return true;
        }
        else
        {
            this._customersComponentStore.discardFromListCustomerToCreate();
            return component.closeDrawer().then(() => true);
        }
    }
}
