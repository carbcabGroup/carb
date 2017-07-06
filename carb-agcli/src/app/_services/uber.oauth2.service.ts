import { Injectable } from '@angular/core';
//import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { HttpInterceptor } from '../../http-interceptor/http.interceptor';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'

import { UserTokenData } from '../_models/index';
import { UberAuthRequestParams } from '../_models/index';
import { UberAuthResponse } from '../_models/index';
import { UberTokenRequestParams } from '../_models/index';
import { UberTokenResponse } from '../_models/index';
import { UberRefreshRequestParams } from '../_models/index';
import { UberRevokeRequestParams } from '../_models/index';

import { UserTokenService } from './index';

@Injectable()
export class UberOAuth2Service {
    client_id: string;
    client_secret: string;

    constructor(
        private http: HttpInterceptor,
        private userTokenService: UserTokenService) {
        this.client_id = '8mbR_i3W8ekCHYeb4xcCKbi__9OLx2pu';
        this.client_secret = 'm1S9NG_UtuK2zMlUyOktpBc2e3R60GtyTCAgZ7qD';
    }

    getToken(authCode: string): Observable<UberTokenResponse[]> {
        let body = <UberTokenRequestParams>({
            client_id: this.client_id,
            client_secret: this.client_secret,
            grant_type: 'authorization_code',
            redirect_uri: 'https://127.0.0.1:4200/uberauth',
            code: authCode
        });

        let urlbase = 'https://login.uber.com';

        // get user overview
        console.log('Getting new uber token...');
        let path = '/oauth/v2/token';
        let url = urlbase + path;
        let tokenResults: Observable<UberTokenResponse[]> = this.http.post(url, body)
            .map(mapTokenResp).catch(this.handleError);
        console.log('Token info:');
        console.log(tokenResults);
        return tokenResults;
    }

    refreshToken(token: string): Observable<UberTokenResponse[]> {
        let body = <UberRefreshRequestParams>({
            client_id: this.client_id,
            client_secret: this.client_secret,
            grant_type: 'refresh_token',
            refresh_token: token
        });

        let urlbase = 'https://login.uber.com';

        // get user overview
        console.log('Getting new uber token...');
        let path = '/oauth/v2/token';
        let url = urlbase + path;
        let tokenResults: Observable<UberTokenResponse[]> = this.http.post(url, body)
            .map(mapTokenResp).catch(this.handleError);
        console.log('Token info:');
        console.log(tokenResults);
        return tokenResults;
    }

    // TODO: revoke token

    private handleError(error: any) {
        let msg = error.message || "Error accessing API.";
        console.error(msg);
        return Observable.throw(msg);
    }
}

// Static helpers
function mapTokenResp(r: Response): UberTokenResponse[]{
    console.log('Mapping an Uber token response...');
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
    console.log('Parsed token:', t);
    return t;
}
