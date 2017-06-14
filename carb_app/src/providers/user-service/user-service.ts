import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/observable/from'

import { UserTokenProvider } from '../user-token/user-token';

import { User } from '../../models/index';
import { UserTokenData } from '../../models/index';
import { TokenDataRequestParams } from '../../models/index';

/*
  Generated class for the UserServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UserServiceProvider {

    constructor(public http: Http,
                private userTokenService: UserTokenProvider,) {
        console.log('Hello UserServiceProvider Provider');
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
        let observedTokens = tokenRequests.map(params => {
            return this.userTokenService.getUserToken(params);
        }).catch(this.handleError);
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
