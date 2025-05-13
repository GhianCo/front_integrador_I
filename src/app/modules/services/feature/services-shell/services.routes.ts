import {Routes} from '@angular/router';
import {ServicesWrapper} from "./services.wrapper";
import {ServicesListComponent} from "../services-list/services.list.component";
import {ServiceDetailComponent} from "../service-detail/service.detail.component";
import {CanDeactivateServicesDetail} from "../service-detail/service.detail.guard";
import {ServicesListResolver} from "../services-list/services.list.resolver";
import {ServiceDetailResolver} from "../service-detail/service.detail.resolver";

export default [
    {
        path: '',
        component: ServicesWrapper,
        children: [
            {
                path: '',
                component: ServicesListComponent,
                resolve: {
                  providers: ServicesListResolver,
                },
                children: [
                    {
                        path: 'new',
                        component: ServiceDetailComponent,
                        canDeactivate: [CanDeactivateServicesDetail]
                    },
                    {
                        path: ':id',
                        component: ServiceDetailComponent,
                        resolve: {
                            provider: ServiceDetailResolver,
                        },
                        canDeactivate: [CanDeactivateServicesDetail]
                    }
                ]
            },
        ]
    },
] as Routes;
