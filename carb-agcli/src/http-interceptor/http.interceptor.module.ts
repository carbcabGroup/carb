import { NgModule }      from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';

import { HttpInterceptor } from './http.interceptor';
import { httpInterceptorFactory } from './http.interceptor.factory';

@NgModule({
    imports: [],
    declarations: [],
    providers: [
        {
            provide: HttpInterceptor,
            useFactory: httpInterceptorFactory,
            deps: [XHRBackend, RequestOptions, Router]
        }
    ],
    exports: []
})

export class HttpInterceptorModule { }
