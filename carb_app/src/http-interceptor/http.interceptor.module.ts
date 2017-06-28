import { NgModule }      from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';
import { NavController } from 'ionic-angular';

import { HttpInterceptor } from './http.interceptor';
import { httpInterceptorFactory } from './http.interceptor.factory';

@NgModule({
    imports: [],
    declarations: [],
    providers: [
        {
            provide: HttpInterceptor,
            useFactory: httpInterceptorFactory,
            deps: [XHRBackend, RequestOptions, NavController]
        }
    ],
    exports: []
})

export class HttpInterceptorModule { }