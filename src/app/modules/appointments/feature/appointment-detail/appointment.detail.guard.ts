import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AppointmentDetailComponent } from './appointment.detail.component';
import {AppointmentsComponentStore} from "../../data-access/appointments.component.store";

@Injectable({ providedIn: 'root'})
export class CanDeactivateAppointmentsDetail implements CanDeactivate<AppointmentDetailComponent>
{
    constructor(
        private _appointmentsComponentStore: AppointmentsComponentStore,

    ) {
    }
    canDeactivate(
        component: AppointmentDetailComponent,
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

        if ( !nextState.url.includes('/mascotas') )
        {
            return true;
        }

        if ( nextRoute.paramMap.get('id'))
        {
            return true;
        }
        else
        {
            this._appointmentsComponentStore.discardFromListAppointmentToCreate();
            return component.closeDrawer().then(() => true);
        }
    }
}
