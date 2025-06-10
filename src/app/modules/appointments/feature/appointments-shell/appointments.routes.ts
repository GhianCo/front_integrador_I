import {Routes} from '@angular/router';
import {AppointmentsWrapper} from "./appointments.wrapper";
import {AppointmentsListComponent} from "../appointments-list/appointments.list.component";
import {AppointmentsListResolver} from "../appointments-list/appointments.list.resolver";
import {AppointmentDetailComponent} from "../appointment-detail/appointment.detail.component";
import {CanDeactivateAppointmentsDetail} from "../appointment-detail/appointment.detail.guard";
import {AppointmentDetailResolver} from "../appointment-detail/appointment.detail.resolver";

export default [
    {
        path: '',
        component: AppointmentsWrapper,
        children: [
            {
                path: '',
                component: AppointmentsListComponent,
                resolve: {
                  providers: AppointmentsListResolver,
                },
                children: [
                    {
                        path: 'new',
                        component: AppointmentDetailComponent,
                        canDeactivate: [CanDeactivateAppointmentsDetail]
                    },
                    {
                        path: ':id',
                        component: AppointmentDetailComponent,
                        resolve: {
                            provider: AppointmentDetailResolver,
                        },
                        canDeactivate: [CanDeactivateAppointmentsDetail]
                    }
                ]
            },
        ]
    },
] as Routes;
