import { XHRBackend, Http, RequestOptions } from "@angular/http";
import { NavController } from 'ionic-angular';

import { HttpInterceptor } from "./http.interceptor";

export function httpInterceptorFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions, navCtrl: NavController): Http {
    return new HttpInterceptor(xhrBackend, requestOptions, navCtrl);
}
