import {Routes} from '@angular/router';
import {PetsWrapper} from "./pets.wrapper";
import {PetsListComponent} from "../pets-list/pets.list.component";
import {PetsListResolver} from "../pets-list/pets.list.resolver";
import {PetDetailComponent} from "../pet-detail/pet.detail.component";
import {CanDeactivatePetsDetail} from "../pet-detail/pet.detail.guard";
import {PetDetailResolver} from "../pet-detail/pet.detail.resolver";

export default [
    {
        path: '',
        component: PetsWrapper,
        children: [
            {
                path: '',
                component: PetsListComponent,
                resolve: {
                  providers: PetsListResolver,
                },
                children: [
                    {
                        path: 'new',
                        component: PetDetailComponent,
                        canDeactivate: [CanDeactivatePetsDetail]
                    },
                    {
                        path: ':id',
                        component: PetDetailComponent,
                        resolve: {
                            provider: PetDetailResolver,
                        },
                        canDeactivate: [CanDeactivatePetsDetail]
                    }
                ]
            },
        ]
    },
] as Routes;
