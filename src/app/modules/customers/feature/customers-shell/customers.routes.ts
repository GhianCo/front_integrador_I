import {Routes} from '@angular/router';
import {CustomersWrapper} from "./customers.wrapper";
import {CustomersListComponent} from "../customers-list/customers.list.component";
import {CustomersListResolver} from "../customers-list/customers.list.resolver";
import {CustomerDetailComponent} from "../customer-detail/customer.detail.component";
import {CanDeactivateCustomersDetail} from "../customer-detail/customer.detail.guard";
import {CustomerDetailResolver} from "../customer-detail/customer.detail.resolver";

export default [
    {
        path: '',
        component: CustomersWrapper,
        children: [
            {
                path: '',
                component: CustomersListComponent,
                resolve: {
                  providers: CustomersListResolver,
                },
                children: [
                    {
                        path: 'new',
                        component: CustomerDetailComponent,
                        canDeactivate: [CanDeactivateCustomersDetail]
                    },
                    {
                        path: ':id',
                        component: CustomerDetailComponent,
                        resolve: {
                            provider: CustomerDetailResolver,
                        },
                        canDeactivate: [CanDeactivateCustomersDetail]
                    }
                ]
            },
        ]
    },
] as Routes;
