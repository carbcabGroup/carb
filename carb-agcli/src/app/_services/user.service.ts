﻿import { Injectable } from '@angular/core';
//import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { HttpInterceptor } from '../../http-interceptor/http.interceptor';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'

import { User } from '../_models/index';

@Injectable()
export class UserService {
    constructor(private http: HttpInterceptor) {}

    getUsers(): Observable<User[]> {
        let urlbase = 'https://13.58.151.236:8088';

        // get user overview
        console.log('Getting user details...');
        let path = '/users/';
        let url = urlbase + path;
        let userResults: Observable<User[]> = this.http.get(url)
            .map(mapUserResp).catch(this.handleError);
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
