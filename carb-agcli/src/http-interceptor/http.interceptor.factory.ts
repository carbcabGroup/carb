import { XHRBackend, Http, RequestOptions } from "@angular/http";
import { Router } from '@angular/router';

import { AuthenticationService } from "../core/_services/index";
import { HttpInterceptor } from "./http.interceptor";

export function httpInterceptorFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions, router: Router, authenticationService: AuthenticationService): Http {
    return new HttpInterceptor(xhrBackend, requestOptions, router, authenticationService);
}
