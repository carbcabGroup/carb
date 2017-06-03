import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/map'
import 'rxjs/add/observable/of'

import { AuthenticationService } from './index';
import { User } from '../_models/index';
import { UserTokenData } from '../_models/index';
import { TokenDataRequestParams } from '../_models/index';

// Class to manage API calls as an async streaming service
@Injectable()
export class UserTokenService {
    constructor(
        private http: Http,
        private authenticationService: AuthenticationService) {
    }

    // Get a specific token
    getUserToken(t_params: TokenDataRequestParams): Observable<UserTokenData[]> {
        console.log('Getting "' + t_params.serviceName + '" details...');
        if (t_params.id.length == 0) {
            console.log('...no tokens for this service.');
            let userTokens: UserTokenData[] = [];
            return Observable.of(userTokens);
        }
        console.log('...tokens exist; continuing...');
        // add authorization header with jwt token
        let urlbase = 'http://52.15.168.69:8088';
        let headers = new Headers({ 'Authorization': 'JWT ' + this.authenticationService.token });
        let options = new RequestOptions({ headers: headers });

        console.log('Retrieving token details...');
        let path = t_params.path + '/' + t_params.id[0];
        let url = urlbase + path;
        let userTokens = this.http.get(url, options).map(mapTokenResp).catch(this.handleError);
        return userTokens;
    }

    private handleError(error: any) {
        let msg = error.message || "Error accessing API.";
        console.error(msg);
        return Observable.throw(msg);
    }
}

// Static helpers
function mapTokenResp(r: Response): UserTokenData[]{
    console.log('Mapping a token API response...');
    let tokenData = r.json().results.map(toUserTokenData);
    // peel off last field from originator
    // need to regex <stuff><servicepath><id>
    tokenData.serviceName = r.url;
    return tokenData;
}

function toUserTokenData(r: any): UserTokenData{
    let token = <UserTokenData>({
        serviceName: '',

        id: r.id,
        access_token: r.access_token,
        refresh_token: r.refresh_token,
        access_token_exp: r.access_token_exp,
        auth_uuid: r.auth_uuid,
        auth_code: r.auth_code,
        auth_scope: r.auth_scope,
        owner: r.owner,
        updated: r.updated,
    });
    console.log('Parsed user token:', token);
    return token;
}
