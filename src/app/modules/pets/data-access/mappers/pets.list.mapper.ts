import {PARAM} from '@shared/constants';
import {MainMapper} from '@shared/mappers/main.mapper';

export class PetsListMapper extends MainMapper<any, any> {
    protected map(pet: any): any {
        return {
            ...pet,
            pet_active: pet.service_active == PARAM.ACTIVO
        }
    }

}
