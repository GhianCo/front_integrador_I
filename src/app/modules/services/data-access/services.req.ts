import { Injectable } from '@angular/core';
import { map } from "rxjs/operators";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { ParseDataResponseMapper } from '@shared/mappers/parse.data.response.mapper';
import { IResponse } from '@shared/interfaces/IResponse';
import { ServicesListMapper } from './mappers/services.list.mapper';
import {HttpService} from "@shared/services/http.service";

@Injectable({
    providedIn: 'root'
})

export class ServicesReq {

    private parseDataResponseMapper = new ParseDataResponseMapper();
    private servicesListMapper = new ServicesListMapper();

    private REMOTE_API_URI = environment.apiRest;

    constructor(
        private http: HttpService,
    ) {
    }

    requestSearchServicesByCriteria(criteria): Observable<IResponse> {
        const {query, page, perPage} = criteria;
        return this.http.get(this.REMOTE_API_URI + 'service/getAll?query=' + query + '&page=' + page + '&perPage=' + perPage)
            .pipe(
                map((data: any) => {
                    const response = this.parseDataResponseMapper.transform(data);
                    if (response.data) {
                        response.data = this.servicesListMapper.transform(response.data);
                    }
                    return response;
                })
            );
    }

    requestCreateService(service): Observable<IResponse> {
        return this.http.post(this.REMOTE_API_URI + 'service', service)
            .pipe(
                map((data: any) => {
                    const response = this.parseDataResponseMapper.transform(data);
                    if (response.data) {
                        response.data = this.servicesListMapper.transform(response.data);
                    }
                    return response;
                })
            );
    }

    requestUpdateService(service): Observable<IResponse> {
        const { service_id } = service;
        return this.http.put(this.REMOTE_API_URI + 'service',service_id, service)
            .pipe(
                map((data: any) => {
                    const response = this.parseDataResponseMapper.transform(data);
                    if (response.data) {
                        response.data = this.servicesListMapper.transform(response.data);
                    }
                    return response;
                })
            );
    }

}
