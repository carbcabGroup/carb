import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'

import { AuthenticationService } from './index';
import { User } from '../_models/index';

@Injectable()
export class UserService {
    constructor(
        private http: Http,
        private authenticationService: AuthenticationService) {
    }

    getUsers(): Observable<User[]> {
        // add authorization header with jwt token
        let urlbase = 'http://52.15.168.69:8088';
        let headers = new Headers({ 'Authorization': 'JWT ' + this.authenticationService.token });
        let options = new RequestOptions({ headers: headers });

        // get user overview
        console.log('Getting user details...');
        let path = '/users';
        let url = urlbase + path;
        let userResults = this.http.get(url, options).map(mapUserResp).catch(this.handleError);
        console.log('User info:');
        console.log(userResults);
        return userResults;
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
