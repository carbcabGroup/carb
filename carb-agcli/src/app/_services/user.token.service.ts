import { Injectable } from '@angular/core';
//import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { HttpInterceptor } from '../../http-interceptor/http.interceptor';
import { RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/map'
import 'rxjs/add/observable/of'

import { UserTokenData } from '../_models/index';
import { TokenDataRequestParams } from '../_models/index';
import { TokenDataSearchParams } from '../_models/index';

// Class to manage API calls as an async streaming service
@Injectable()
export class UserTokenService {
    public token: string;

    constructor(private http: HttpInterceptor) {}

    // Get a specific token by id
    getUserToken(t_params: TokenDataRequestParams): Observable<UserTokenData[]> {
        console.log('Getting "' + t_params.serviceName + '" details...');
        if (t_params.id.length == 0) {
            console.log('...no tokens for this service.');
            let userTokens: UserTokenData[] = [];
            return Observable.of(userTokens);
        }
        console.log('...tokens exist; continuing...');

        let urlbase = 'https://13.58.151.236:8088';

        console.log('Retrieving token details...');
        let path = t_params.path + t_params.id[0] + '/';
        let url = urlbase + path;
        let userTokens: Observable<UserTokenData[]> = this.http.get(url).map(r => {
            return mapTokenResp(r, t_params.serviceName);
        }).catch(this.handleError);
        return userTokens;
    }

    // Get a specific  token by uuid
    getUserTokenByUuid(t_params: TokenDataSearchParams): Observable<UserTokenData[]> {
        console.log('Finding "' + t_params.serviceName + '" details...');
        if (!t_params.authUuid) {
            console.log('...invalid token state.');
            let userTokens: UserTokenData[] = [];
            return Observable.of(userTokens);
        }
        console.log('...UUID exists; continuing...');

        let urlbase = 'https://13.58.151.236:8088';
        let params = new URLSearchParams();
        params.set('search', t_params.authUuid);
        let options = new RequestOptions({ params: params });

        console.log('Searching for token details...');
        let path = t_params.path;
        let url = urlbase + path;
        let userTokens: Observable<UserTokenData[]> = this.http.get(url, options).map(r => {
            return mapTokenResp(r, t_params.serviceName);
        }).catch(this.handleError);
        return userTokens;
    }

    saveToken(t_params: TokenDataRequestParams, token: UserTokenData): Observable<UserTokenData[]> {
        console.log('Saving "' + t_params.serviceName + '" details...');

        let urlbase = 'https://13.58.151.236:8088';
        let body = { access_token: token.access_token,
                     refresh_token: token.refresh_token,
                     access_token_exp: token.access_token_exp,
                     auth_code: token.auth_code,
                     auth_scope: token.auth_scope };

        console.log('Saving token details...');
        let path = t_params.path + token.id + '/';
        let url = urlbase + path;
        let userTokens: Observable<UserTokenData[]> = this.http.put(url, body).map(r => {
            return mapTokenResp(r, t_params.serviceName);
        }).catch(this.handleError);
        return userTokens;
    }

    // Initialize empty token in database
    makeEmptyToken(t_params: TokenDataRequestParams): Observable<UserTokenData[]> {
        console.log('Creating empty "' + t_params.serviceName + '" token details...');

        let urlbase = 'https://13.58.151.236:8088';
        let body = {};

        let path = t_params.path;
        let url = urlbase + path;
        let userTokens: Observable<UserTokenData[]> = this.http.post(url, body).map(r => {
            return mapTokenResp(r, t_params.serviceName);
        }).catch(this.handleError);
        return userTokens;
    }

    private handleError(error: any) {
        let msg = error.message || "Error accessing API.";
        console.error(msg);
        return Observable.throw(msg);
    }
}

// Static helpers
function mapTokenResp(r: Response, n: string): UserTokenData[]{
    console.log('Mapping a token API response:');
    console.log(r.json());
    let tokenData: UserTokenData = toUserTokenData(r.json());
    tokenData.serviceName = n;
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
