import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { PetDetailComponent } from './pet.detail.component';
import {PetsComponentStore} from "../../data-access/pets.component.store";

@Injectable({ providedIn: 'root'})
export class CanDeactivatePetsDetail implements CanDeactivate<PetDetailComponent>
{
    constructor(
        private _petsComponentStore: PetsComponentStore,

    ) {
    }
    canDeactivate(
        component: PetDetailComponent,
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
            this._petsComponentStore.discardFromListPetToCreate();
            return component.closeDrawer().then(() => true);
        }
    }
}
