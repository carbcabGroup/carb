import { Component, OnInit } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { DTokenProvider } from '../../providers/d-token/d-token';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
    model: any = {};
    loading = false;
    error = '';

    constructor(public navCtrl: NavController, 
                public dtoken: DTokenProvider) { }

    ngOnInit() {
        // reset login status
        this.dtoken.logout();
    }

    getToken() {
        this.dtoken.login(this.model.username, this.model.password)
            .subscribe(result => {
                console.log('Login attempt succeeded:');
                console.log(result);
                if (result === true) {
                    console.log('Redirecting to home...');
                } else {
                    this.error = 'Username or password is incorrect';
                    this.loading = false;
                }
            });
    }
}
