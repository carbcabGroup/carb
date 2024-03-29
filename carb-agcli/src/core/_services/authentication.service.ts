﻿import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
//import { HttpInterceptor } from '../../http-interceptor/http.interceptor';
//import { Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthenticationService {
    public token: string;

//    constructor(private http: HttpInterceptor) {
    constructor(private http: Http) {
        // set token if saved in local storage
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    getToken(username: string, password: string) {
        let urlbase = 'https://13.58.151.236:8088';
        let path = '/api-token-auth/';
        let url = urlbase + path;
        let headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        });
        let options = new RequestOptions({
            headers: headers
        });
        let body = JSON.stringify({ username: username, password: password });
        return this.http.post(url, body, options);
    }

    refreshToken(token: string) {
        let urlbase = 'https://13.58.151.236:8088';
        let path = '/api-token-refresh/';
        let url = urlbase + path;
        let headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        });
        let options = new RequestOptions({
            headers: headers
        });
        let body = JSON.stringify({ token: token });
        return this.http.post(url, body, options);
    }

    login(username: string, password: string): Observable<boolean> {
        return this.getToken(username, password)
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                let token = response.json() && response.json().token;
                console.log('Retrieved carb token:');
                console.log(token);
                if (token) {
                    // set token property
                    this.token = token;

                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify({ username: username, token: token }));
                    //localStorage.setItem('id_token', token);
                    console.log('Saved access for current session:');
                    console.log(localStorage);

                    // return true to indicate successful login
                    return true;
                } else {
                    // return false to indicate failed login
                    return false;
                }
            });
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        localStorage.removeItem('currentUser');
    }

    refresh(): Observable<boolean> {
        return this.refreshToken(this.token)
            .map((response: Response) => {
                // refresh successful if there's a jwt token in the response
                let token = response.json() && response.json().token;
                console.log('Refreshed carb token:');
                console.log(token);
                if (token) {
                    // set token property
                    this.token = token;

                    // update jwt token in local storage to keep user logged in between page refreshes
                    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    currentUser.token = token;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    console.log('Refreshed access for current session:');
                    console.log(localStorage);

                    // return true to indicate successful refresh
                    return true;
                } else {
                    // return false to indicate failed refresh
                    return false;
                }
            });
    }
}
