import {PARAM} from '@shared/constants';
import {MainMapper} from '@shared/mappers/main.mapper';

export class ServicesListMapper extends MainMapper<any, any> {
    protected map(service: any): any {
        return {
            ...service,
            service_activa: service.service_activa == PARAM.ACTIVO
        }
    }

}
