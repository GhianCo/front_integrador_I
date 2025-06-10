import {PARAM} from '@shared/constants';
import {DateService} from "@shared/services/date.service";
import {MainMapper} from "@shared/mappers/main.mapper";

export class AppointmentsListMapper extends MainMapper<any, any> {
    protected map(appointment: any): any {
        return {
            ...appointment,
            birthdateFormat: DateService.formatDateString(appointment.birthdate, 'dd/MM/yyyy'),
            appointment_active: appointment.active == PARAM.ACTIVO
        }
    }

}
