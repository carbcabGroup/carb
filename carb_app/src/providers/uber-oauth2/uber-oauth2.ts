import { Injectable } from '@angular/core';
import { HttpInterceptor } from '../../http-interceptor/http.interceptor';
import { Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'

import { UberTokenRequestParams } from '../../models/index';
import { UberTokenResponse } from '../../models/index';
import { UberRefreshRequestParams } from '../../models/index';

import { UserTokenProvider } from '../user-token/user-token';

/*
  Generated class for the UberOauth2Provider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UberOauth2Provider {
    public client_id: string;
    public client_secret: string;

    constructor(public http: HttpInterceptor,
        private userTokenService: UserTokenProvider) {
        //console.log('Hello UberOauth2Provider Provider');
        this.client_id = '8mbR_i3W8ekCHYeb4xcCKbi__9OLx2pu';
        this.client_secret = 'm1S9NG_UtuK2zMlUyOktpBc2e3R60GtyTCAgZ7qD';
    }

    getToken(authCode: string): Observable<UberTokenResponse[]> {

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let body = <UberTokenRequestParams>({
            client_id: this.client_id,
            client_secret: this.client_secret,
            grant_type: 'authorization_code',
            redirect_uri: 'https://127.0.0.1:4200/uberauth',
            code: authCode
        });

        let urlbase = 'https://login.uber.com';
        let options = new RequestOptions({ headers: headers });

        // get user overview
        //console.log('Getting new uber token...');
        let path = '/oauth/v2/token';
        let url = urlbase + path;
        let tokenResults: Observable<UberTokenResponse[]> = this.http.post(url, body, options)
            .map(mapTokenResp).catch(this.handleError);
        //console.log('Token info:');
        //console.log(tokenResults);
        return tokenResults;
    }

    refreshToken(token: string): Observable<UberTokenResponse[]> {

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let body = <UberRefreshRequestParams>({
            client_id: this.client_id,
            client_secret: this.client_secret,
            grant_type: 'refresh_token',
            refresh_token: token
        });

        let urlbase = 'https://login.uber.com';
        let options = new RequestOptions({ headers: headers });

        // get user overview
        //console.log('Getting new uber token...');
        let path = '/oauth/v2/token';
        let url = urlbase + path;
        let tokenResults: Observable<UberTokenResponse[]> = this.http.post(url, body, options)
            .map(mapTokenResp).catch(this.handleError);
        //console.log('Token info:');
        //console.log(tokenResults);
        return tokenResults;
    }

    private handleError(error: any) {
        let msg = error.message || "Error accessing API.";
        //console.error(msg);
        return Observable.throw(msg);
    }
}

// Static helpers
function mapTokenResp(r: Response): UberTokenResponse[]{
    //console.log('Mapping an Uber token response...');
    return r.json().results.map(toUberTokenResponse);
}

function toUberTokenResponse(r: any): UberTokenResponse{
    let t = <UberTokenResponse>({
        access_token: r.access_token,
        token_type: r.token_type,
        expires_in: r.expires_in,
        refresh_token: r.refresh_token,
        scope: r.scope
    });
    //console.log('Parsed token:', t);
    return t;
}

