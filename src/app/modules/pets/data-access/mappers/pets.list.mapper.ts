import {PARAM} from '@shared/constants';
import {DateService} from "@shared/services/date.service";
import {MainMapper} from "@shared/mappers/main.mapper";

export class PetsListMapper extends MainMapper<any, any> {
    protected map(pet: any): any {
        return {
            ...pet,
            birthdateFormat: DateService.formatDateString(pet.birthdate, 'dd/MM/yyyy'),
            pet_active: pet.active == PARAM.ACTIVO
        }
    }

}
