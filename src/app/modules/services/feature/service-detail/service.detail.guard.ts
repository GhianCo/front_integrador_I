import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ServiceDetailComponent } from './service.detail.component';
import {ServicesComponentStore} from "../../data-access/services.component.store";

@Injectable({ providedIn: 'root'})
export class CanDeactivateServicesDetail implements CanDeactivate<ServiceDetailComponent>
{
    constructor(
        private _servicesComponentStore: ServicesComponentStore,

    ) {
    }
    canDeactivate(
        component: ServiceDetailComponent,
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

        if ( !nextState.url.includes('/servicios') )
        {
            return true;
        }

        if ( nextRoute.paramMap.get('id'))
        {
            return true;
        }
        else
        {
            this._servicesComponentStore.discardFromListServiceToCreate();
            return component.closeDrawer().then(() => true);
        }
    }
}
