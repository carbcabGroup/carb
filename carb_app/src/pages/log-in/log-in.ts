import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { DTokenProvider } from '../../providers/d-token/d-token';

/**
 * Generated class for the LogInPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-log-in',
  templateUrl: 'log-in.html',
})
export class LogInPage {

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
                //console.log('Login attempt succeeded:');
                //console.log(result);
                if (result === true) {
                    //console.log('Redirecting to home...');
                    this.navCtrl.push("HomePage");
                } else {
                    this.error = 'Username or password is incorrect';
                    this.loading = false;
                }
            });
    }

}
