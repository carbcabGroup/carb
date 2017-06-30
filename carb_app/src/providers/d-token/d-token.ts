import { Injectable } from '@angular/core';
import { HttpInterceptor } from '../../http-interceptor/http.interceptor';
import { Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

/*
  Generated class for the DTokenProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

@Injectable()
export class DTokenProvider {
    public token: string;

    constructor(public http: HttpInterceptor) {
        //console.log('Hello DTokenProvider Provider');
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    login(username: string, password: string): Observable<boolean> {
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
        return this.http.post(url, JSON.stringify({ username: username, password: password }), options)
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                let token = response.json() && response.json().token;
                //console.log('Retrieved carb token:');
                //console.log(token);
                if (token) {
                    // set token property
                    this.token = token;

                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify({ username: username, token: token }));
                    //localStorage.setItem('id_token', token);
                    //console.log('Saved access for current session:');
                    //console.log(localStorage);

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

}
