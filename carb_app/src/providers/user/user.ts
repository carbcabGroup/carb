import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the UserProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UserProvider {

  public auth: string;

  constructor(public http: Http) {
    console.log('user provider'); 
  }

  getUsers() {
    this.auth = localStorage.getItem('currentUser')
    console.log(JSON.parse(this.auth).token);
  }

}
