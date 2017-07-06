import { Injectable } from '@angular/core';
import { Http,
         ConnectionBackend,
         Request,
         RequestOptions,
         RequestOptionsArgs,
         Response,
         Headers } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeAll';

import { AuthenticationService } from '../core/_services/index';

// Wrap all requests with interecept() to catch errors early
@Injectable()
export class HttpInterceptor extends Http {
    token: string;

    constructor(backend: ConnectionBackend,
                defaultOptions: RequestOptions,
                private _router: Router,
                private authenticationService: AuthenticationService) {
        super(backend, defaultOptions);
        console.log('Creating interceptor...');
        this.updateCarbToken();
    }

    // All specific requests are transformed into general requests eventually
    // note: if url is Request, options are ignored
    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        console.log('Interceptor making request...');
        return this.intercept(url, options);
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.get(url, options);
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return super.post(url, body, options);
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return super.put(url, body, options);
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.delete(url, options);
    }

    // Optional wrapper to fix requests and catch any bad responses
    intercept(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        console.log('Updating request...');
        var req_url: string;
        if (typeof url === 'string') {
            console.log('URL was string');
            req_url = url;
        } else { // Request - split components for modification
            console.log('URL was premade Request');
            req_url = url.url;
        }
        console.log('Calling');
        console.log(req_url);

        console.log('Initial options:');
        console.log(options);

        if (this.isCarbCall(req_url)
            || this.isUberCall(req_url)) {
            var headers: Headers;
            if (typeof url === 'string') {
                if (!options) {
                    options = new RequestOptions();
                }
                headers = options.headers;
            } else {
                headers = url.headers;
            }
            console.log('Initial headers:');
            console.log(headers);

            if (this.isCarbCall(req_url)) {
                console.log('Getting updated Carb request headers...');
                headers = this.getCarbRequestHeaders(headers);
            }
            if (this.isUberCall(req_url)) {
                console.log('Getting updated Uber request options...');
                headers = this.getUberRequestHeaders(headers);
            }
            if (typeof url === 'string') {
                options.headers = headers;
            } else {
                url.headers = headers;
            }
            console.log('Final headers:')
            console.log(headers.toJSON());
        }

        console.log('Final options:')
        console.log(options);

        return super.request(url, options).catch((err: Response, caught) => {
            console.log('Error:');
            console.log(err);
            console.log('Source:');
            console.log(caught);
            if (err.status == 401) {
                console.log('Caught unauthorized request.');
                if (this.isCarbCall(err.url)) {
                    // If Carb access expired, auto-refresh without disturbing user
                    console.log('Refreshing Carb token...');
                    let authResp: Observable<boolean> = this.authenticationService.refresh();
                    let newResp = authResp.map(result => {
                        console.log('Refresh attempt succeeded:');
                        console.log(result)
                        if (result == true) {
                            console.log('Retrying request...');
                            this.updateCarbToken();
                            options.headers.set('Authorization', 'JWT ' + this.token);
                            return super.request(url, options);
                        } else {
                            console.log('Aborting request.');
                            return Observable.empty();
                        }
                    });
                    return newResp.mergeAll();
                } else {
                    console.log('Skipping unhandled 401.');
                    return Observable.empty();
                }
            } else {
                console.log('Caught unknown error.');
                return Observable.throw(err);
            }
        });
    }

    // set token if saved in local storage
    updateCarbToken() {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        console.log('Updating Carb credentials:');
        console.log('User:')
        console.log(currentUser);
        console.log('Token:')
        console.log(this.token);
    }

    // Optional wrappers to standardize request options
    getCarbRequestHeaders(headers: Headers): Headers {
        if (!headers) {
            headers = new Headers();
        }
        // add authorization header with jwt token
        if (headers.has('Authorization')) {
            headers.set('Authorization', 'JWT ' + this.token);
        } else {
            headers.append('Authorization', 'JWT ' + this.token);
        }
        return headers;
    }

    getUberRequestHeaders(headers: Headers): Headers {
        if (!headers) {
            headers = new Headers();
        }
        // mark all API calls as JSON
        if (headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        } else {
            headers.append('Content-Type', 'application/json');
        }
        return headers;
    }

    isCarbCall(s: string): boolean {
        return (/^https:\/\/13\.58\.151\.236:8088\//.test(s));
    }

    isUberCall(s: string): boolean {
        return (/^https:\/\/[^\.]+\.uber\.com/.test(s));
    }
}
