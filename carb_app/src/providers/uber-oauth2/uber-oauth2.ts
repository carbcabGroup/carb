import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the UberOauth2Provider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UberOauth2Provider {

  constructor(public http: Http) {
    console.log('Hello UberOauth2Provider Provider');
  }

}
