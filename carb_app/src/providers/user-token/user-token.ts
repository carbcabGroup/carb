import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/map'
import 'rxjs/add/observable/of'

import { UserTokenData } from '../../models/index';
import { TokenDataRequestParams } from '../../models/index';

/*
  Generated class for the UserTokenProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UserTokenProvider {
    public auth: string;
    public token: string;

    constructor(public http: Http) {
        console.log('Hello UserTokenProvider Provider');
    }

    // Get a specific token
    getUserToken(t_params: TokenDataRequestParams): Observable<UserTokenData[]> {
        this.auth = localStorage.getItem('currentUser')
        console.log(JSON.parse(this.auth).token);
        this.token = JSON.parse(this.auth).token
        console.log('Getting "' + t_params.serviceName + '" details...');
        if (t_params.id.length == 0) {
            console.log('...no tokens for this service.');
            let userTokens: UserTokenData[] = [];
            return Observable.of(userTokens);
        }
        console.log('...tokens exist; continuing...');
        // add authorization header with jwt token
        let urlbase = 'https://13.58.151.236:8088';
        let headers = new Headers({ 'Authorization': 'JWT ' + this.token });
        let options = new RequestOptions({ headers: headers });

        console.log('Retrieving token details...');
        let path = t_params.path + '/' + t_params.id[0] + '/';
        let url = urlbase + path;
        console.log('Going into blackhole...');
        let userTokens = this.http.get(url, options).map(mapTokenResp).catch(this.handleError);
        console.log('return userTokens');
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
    let tokenData = toUserTokenData(r.json());
    // peel off last field from originator
    // need to regex <stuff><servicepath><id>
    console.log('after parse');
    tokenData.serviceName = r.url;
    console.log('after serviceName set');
    return [tokenData];
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
