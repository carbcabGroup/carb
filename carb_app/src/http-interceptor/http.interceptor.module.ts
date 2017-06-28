import { NgModule }      from '@angular/core';
import { XHRBackend, RequestOptions } from '@angular/http';

import { HttpInterceptor } from './http.interceptor';
import { httpInterceptorFactory } from './http.interceptor.factory';

@NgModule({
    imports: [],
    declarations: [],
    providers: [
        {
            provide: HttpInterceptor,
            useFactory: httpInterceptorFactory,
            deps: [XHRBackend, RequestOptions]
        }
    ],
    exports: []
})

export class HttpInterceptorModule { }