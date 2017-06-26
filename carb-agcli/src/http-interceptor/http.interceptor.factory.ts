import { XHRBackend, Http, RequestOptions } from "@angular/http";
import { Router } from '@angular/router';

import { HttpInterceptor } from "./http.interceptor";

export function httpInterceptorFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions, router: Router): Http {
    return new HttpInterceptor(xhrBackend, requestOptions, router);
}
