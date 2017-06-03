import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/observable/from'

import { AuthenticationService } from './index';
import { UserTokenService } from './index';
import { User } from '../_models/index';
import { UserTokenData } from '../_models/index';
import { TokenDataRequestParams } from '../_models/index';

// Class to manage API calls as an async streaming service
@Injectable()
export class UserConnectionService {
    constructor(
        private http: Http,
        private authenticationService: AuthenticationService,
        private userTokenService: UserTokenService,) {
    }

    // Get all the tokens associated with a user
    getUserTokens(user: User): Observable<UserTokenData[]> {
        // get tokens from api
        // ...maybe use a services class to manage
        // a map of service names/API paths
        console.log('Getting token details for "' + user.username + '"...');
        var api_requests: TokenDataRequestParams[] = [
                <TokenDataRequestParams>({ serviceName: 'lyft', path: '/lyft_token', id: user.lyft_token }),
                <TokenDataRequestParams>({ serviceName: 'uber', path: '/uber_token', id: user.uber_token }),
        ];
        let tokenRequests = Observable.from(api_requests);
        let observedTokens = tokenRequests.map(this.userTokenService.getUserToken).catch(this.handleError);
        let userTokens = observedTokens.mergeAll();
        console.log('Token info:');
        console.log(userTokens);
        return userTokens;
    }

    private handleError(error: any) {
        let msg = error.message || "Error accessing API.";
        console.error(msg);
        return Observable.throw(msg);
    }
}
