import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AppointmentsComponentStore} from "../../data-access/appointments.component.store";

@Injectable({ providedIn: 'root'})
export class AppointmentsListResolver implements Resolve<any> {
    constructor(
        private _servicesComponentStore: AppointmentsComponentStore,
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._servicesComponentStore.loadAllAppointments();
    }
}
