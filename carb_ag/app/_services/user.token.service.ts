import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'

import { AuthenticationService } from './index';
import { User } from '../_models/index';
import { UserTokenData } from '../_models/index';

// Class to manage API calls as an async streaming service
@Injectable()
export class UserTokenService {
    constructor(
        private http: Http,
        private authenticationService: AuthenticationService) {
    }

    getUserTokens(): Observable<User[]> {
        // add authorization header with jwt token
        let urlbase = 'http://52.15.168.69:8088';
        let headers = new Headers({ 'Authorization': 'JWT ' + this.authenticationService.token });
        let options = new RequestOptions({ headers: headers });

        // get user overview
        console.log('Getting user details...');
        let path = '/users';
        let url = urlbase + path;
        let userResults = this.http.get(url, options).map(mapUserResp).catch(this.handleError);
        return userResults;

        /*if (user_resp && user_resp.length > 0) {
            let user_results = user_resp[0];
            // get tokens from api
            // ...maybe use a services class to manage
            // a map of service names/API paths
            var k;
            for (k in user_results) {
                if ((k != 'id') && (k != 'username')
                    && (user_results[k].length > 0)) {
                    console.log('Getting "' + k + '" details...');
                    let path = '/' + k + '/' + user_results[k][0];
                    let url = urlbase + path;
                    let r = this.http.get(url, options).map(mapTokenResp);
                    let curTokenData = <UserTokenData>({});
                    if (r && r.length > 0) {
                        curTokenData = r[0];
                        curTokenData.serviceName = k;
                    }
                    userTokens.push(curTokenData);
                }
            }
        }

        return userTokens;*/
    }

    private handleError(error: any) {
        let msg = error.message || "Error accessing API.";
        console.error(msg);
        return Observable.throw(msg);
    }
}

// Static helpers
function mapUserResp(r: Response): User[]{
    console.log('Mapping a user API response...');
    return r.json().results.map(toUser);
}

function toUser(r: any): User{
    let user = <User>({
        id: r.id,
        username: r.username,
        lyft_token: r.lyft_token,
        uber_token: r.uber_token,
    });
    console.log('Parsed user:', user);
    return user;
}

function mapTokenResp(r: Response): UserTokenData[]{
    return r.json().results.map(toUserTokenData);
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
