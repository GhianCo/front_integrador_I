import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { ParseDataResponseMapper } from '@shared/mappers/parse.data.response.mapper';
import { IResponse } from '@shared/interfaces/IResponse';
import { ServicesListMapper } from './mappers/services.list.mapper';

@Injectable({
    providedIn: 'root'
})

export class ServicesReq {

    private parseDataResponseMapper = new ParseDataResponseMapper();
    private servicesListMapper = new ServicesListMapper();

    private REMOTE_API_URI_ACTIVOS = environment.REMOTE_API_URI_ACTIVOS;

    constructor(
        private http: HttpClient,
    ) {
    }

    requestSearchServicesByCriteria(criteria): Observable<IResponse> {
        return this.http.post(this.REMOTE_API_URI_ACTIVOS + 'service/searchByParams', criteria)
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

    requestCreateService(stateFixedAsset): Observable<IResponse> {
        return this.http.post(this.REMOTE_API_URI_ACTIVOS + 'service', stateFixedAsset)
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

    requestUpdateService(stateFixedAsset): Observable<IResponse> {
        const { service_id } = stateFixedAsset;
        return this.http.put(this.REMOTE_API_URI_ACTIVOS + 'service/' + service_id, stateFixedAsset)
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
