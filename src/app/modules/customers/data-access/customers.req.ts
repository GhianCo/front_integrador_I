import {Injectable} from '@angular/core';
import {map} from "rxjs/operators";
import {environment} from "@environments/environment";
import {Observable} from "rxjs";
import {ParseDataResponseMapper} from '@shared/mappers/parse.data.response.mapper';
import {IResponse} from '@shared/interfaces/IResponse';
import {HttpService} from "@shared/services/http.service";
import {CustomersListMapper} from "../../customers/data-access/mappers/customers.list.mapper";

@Injectable({
    providedIn: 'root'
})

export class CustomersReq {

    private parseDataResponseMapper = new ParseDataResponseMapper();
    private customersListMapper = new CustomersListMapper();

    private REMOTE_API_URI = environment.apiRest;

    constructor(
        private http: HttpService,
    ) {
    }

    requestSearchCustomersByCriteria(criteria): Observable<IResponse> {
        const {query, page, perPage} = criteria;
        return this.http.get(this.REMOTE_API_URI + 'customer/getAll?query=' + query + '&page=' + page + '&perPage=' + perPage)
            .pipe(
                map((data: any) => {
                    const response = this.parseDataResponseMapper.transform(data);
                    if (response.data) {
                        response.data = this.customersListMapper.transform(response.data);
                    }
                    return response;
                })
            );
    }

    requestCreateCustomer(customer): Observable<IResponse> {
        return this.http.post(this.REMOTE_API_URI + 'customer', customer)
            .pipe(
                map((data: any) => {
                    const response = this.parseDataResponseMapper.transform(data);
                    if (response.data) {
                        response.data = this.customersListMapper.transform(response.data);
                    }
                    return response;
                })
            );
    }

    requestUpdateCustomer(customer): Observable<IResponse> {
        const {customer_id} = customer;
        return this.http.put(this.REMOTE_API_URI + 'customer', customer_id, customer)
            .pipe(
                map((data: any) => {
                    const response = this.parseDataResponseMapper.transform(data);
                    if (response.data) {
                        response.data = this.customersListMapper.transform(response.data);
                    }
                    return response;
                })
            );
    }

    requestSearchCustomerToCustomerByQuery(query): Observable<IResponse> {
        return this.http.get(this.REMOTE_API_URI + 'customer/getAll?query=' + query + '&page=1&perPage=20')
            .pipe(
                map((data: any) => {
                    const response = this.parseDataResponseMapper.transform(data);
                    response.data = this.customersListMapper.transform(response.data);
                    return response;
                })
            );
    }

}
