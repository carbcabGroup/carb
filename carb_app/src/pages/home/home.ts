import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/observable/of'

import { UserProvider } from '../../providers/user/user';
import { UserServiceProvider } from '../../providers/user-service/user-service';

import { User } from '../../models/index';
import { UserTokenData } from '../../models/index';
/**
 * Generated class for the HomePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
})
export class HomePage {
    userData: User[] = [];
    userString: string = "";
    tokenData: UserTokenData[] = [];
    tokenStrings: string[] = []; // for the template

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public userPi: UserProvider,
                public userConnectionService: UserServiceProvider,
                ) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad HomePage');
        console.log("Connecting to user API...");
        let observedUsers = this.userPi.getUsers();
        observedUsers.subscribe(users => {
            // update template
            this.userData = users;
            this.userString = this.userData[0].username;
        });
        console.log("...done.");
        console.log("Connecting to token API...");
        let observedRequesters = observedUsers.map(users => {
            return Observable.from(users);
        });
        let tokenRequesters: Observable<User> = observedRequesters.mergeAll();
        let observedTokens = tokenRequesters.map(user => {
            return this.userConnectionService.getUserTokens(user);
        });
        let userTokens = observedTokens.mergeAll();
        userTokens.subscribe(tokens => {
            this.tokenData = tokens;
            var i;
            for (i = 0; i < this.tokenData.length; i++) {
                let tString = "Service: " + this.tokenData[i].serviceName
                    + ", Token: " + this.tokenData[i].access_token;
                this.tokenStrings.push(tString);
            }
        });
        console.log("...done.");
    }
}
