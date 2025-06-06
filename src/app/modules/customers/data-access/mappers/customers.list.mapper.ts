import {MainMapper} from "@shared/mappers/main.mapper";

export class CustomersListMapper extends MainMapper<any, any> {
    protected map(customer: any): any {
        return {
            ...customer,
            customer_fullname: customer.name + ' ' +  customer.lastname
        }
    }

}
