﻿import { Injectable } from '@angular/core';
import { Http, Headers, Response , RequestOptions} from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthenticationService {
    public token: string;

    constructor(private http: Http) {
        // set token if saved in local storage
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    login(username: string, password: string): Observable<boolean> {
        let headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        });
        let options = new RequestOptions({
            headers: headers
        });
        return this.http.post('http://52.15.168.69:8088/api-token-auth/', JSON.stringify({ username: username, password: password }), options)
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                let token = response.json() && response.json().token;
                if (token) {
                    // set token property
                    this.token = token;

                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    //localStorage.setItem('currentUser', JSON.stringify({ username: username, token: token }));
                    localStorage.setItem('id_token', token);

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
        localStorage.removeItem('id_token');
    }
}