import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/map'
import 'rxjs/add/observable/of'

import { AuthenticationService } from './index';
import { UserTokenData } from '../_models/index';
import { TokenDataRequestParams } from '../_models/index';
import { TokenDataSearchParams } from '../_models/index';

// Class to manage API calls as an async streaming service
@Injectable()
export class UserTokenService {
    constructor(
        private http: Http,
        private authenticationService: AuthenticationService) {
    }

    // Get a specific token by id
    getUserToken(t_params: TokenDataRequestParams): Observable<UserTokenData[]> {
        console.log('Getting "' + t_params.serviceName + '" details...');
        if (t_params.id.length == 0) {
            console.log('...no tokens for this service.');
            let userTokens: UserTokenData[] = [];
            return Observable.of(userTokens);
        }
        console.log('...tokens exist; continuing...');
        // add authorization header with jwt token
        let urlbase = 'https://13.58.151.236:8088';
        let headers = new Headers({ 'Authorization': 'JWT ' + this.authenticationService.token });
        let options = new RequestOptions({ headers: headers });

        console.log('Retrieving token details...');
        let path = t_params.path + t_params.id[0] + '/';
        let url = urlbase + path;
        let userTokens: Observable<UserTokenData[]> = this.http.get(url, options).map(r => {
            return mapTokenResp(r, t_params.serviceName);
        }).catch(this.handleError);
        return userTokens;
    }

    // Get a specific  token by uuid
    getUserTokenByUuid(t_params: TokenDataSearchParams): Observable<UserTokenData[]> {
        console.log('Getting "' + t_params.serviceName + '" details...');
        if (!t_params.authUuid) {
            console.log('...invalid token state.');
            let userTokens: UserTokenData[] = [];
            return Observable.of(userTokens);
        }
        console.log('...tokens exist; continuing...');
        // add authorization header with jwt token
        let urlbase = 'https://13.58.151.236:8088';
        let headers = new Headers({ 'Authorization': 'JWT ' + this.authenticationService.token });
        let params = new URLSearchParams();
        params.set('search', t_params.authUuid);
        let options = new RequestOptions({ headers: headers, params: params });

        console.log('Retrieving token details...');
        let path = t_params.path;
        let url = urlbase + path;
        let userTokens: Observable<UserTokenData[]> = this.http.get(url, options).map(r => {
            return mapTokenResp(r, t_params.serviceName);
        }).catch(this.handleError);
        return userTokens;
    }

    saveToken(t_params: TokenDataRequestParams, token: UserTokenData): Observable<UserTokenData[]> {
        console.log('Saving "' + t_params.serviceName + '" details...');
        // add authorization header with jwt token
        let urlbase = 'https://13.58.151.236:8088';
        let headers = new Headers({ 'Authorization': 'JWT ' + this.authenticationService.token });
        let body = { access_token: token.access_token,
                     access_token_exp: token.access_token_exp,
                     refresh_token: token.refresh_token,
                     auth_scope: token.auth_scope };
        let options = new RequestOptions({ headers: headers, body: body});

        console.log('Saving token details...');
        let path = t_params.path + token.id + '/';
        let url = urlbase + path;
        let userTokens: Observable<UserTokenData[]> = this.http.put(url, options).map(r => {
            return mapTokenResp(r, t_params.serviceName);
        }).catch(this.handleError);
        return userTokens;
    }

    // Initialize empty token in database
    makeEmptyToken(t_params: TokenDataRequestParams): Observable<UserTokenData[]> {
        console.log('Creating empty "' + t_params.serviceName + '" token details...');
        // add authorization header with jwt token
        let urlbase = 'https://13.58.151.236:8088';
        let headers = new Headers({ 'Authorization': 'JWT ' + this.authenticationService.token });
        let options = new RequestOptions({ headers: headers });

        let path = t_params.path;
        let url = urlbase + path;
        let userTokens: Observable<UserTokenData[]> = this.http.post(url, options).map(r => {
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
    console.log('Mapping a token API response...');
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
