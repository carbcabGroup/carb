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

// Wrap all requests with interecept() to catch errors early
@Injectable()
export class HttpInterceptor extends Http {

    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions, private _router: Router) {
        super(backend, defaultOptions);
    }

    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.request(url, options));
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.get(url,options));
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.post(url, body, options));
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.put(url, body, options));
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.delete(url, options));
    }

    // Optional wrapper to standardize request options
    // e.g.: set all requests as JSON
    getRequestOptionArgs(options?: RequestOptionsArgs) : RequestOptionsArgs {
        if (options == null) {
            options = new RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new Headers();
        }
        options.headers.append('Content-Type', 'application/json');
        return options;
    }

    // Optional wrapper to catch any bad responses
    intercept(observable: Observable<Response>): Observable<Response> {
        return observable.catch((err, source) => {
            console.log(err);
            if (err.status == 401) {
                console.log('Caught unauthorized request.');
                return Observable.empty();
            } else {
                console.log('Caught unknown error.');
                return Observable.throw(err);
            }
        });
    }
}
