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
        
        console.log("Attempting a public Uber API call...");
        let uberPath = '/v1.2/products';
        let uberParams = new URLSearchParams();
        uberParams.set('latitude', '41.884441');
        uberParams.set('longitude', '-87.628503');
        let uberResponse: Observable<Response> = this.uberRequestService.get(uberPath, uberParams);
        uberResponse.subscribe(r => {
            this.uberString = r.status + ' ' + r.statusText;
            if (r.json()) {
                let s_json = JSON.stringify(r.json());
                if (s_json.length > 128) {
                    s_json = s_json.slice(0, 127) + " ...";
                }
                this.uberString = this.uberString + ': ' + s_json;
            }
        }); // fails CORS response
        console.log("...done.");

        console.log("Attempting an OAuth2 Uber API call...");
        observedUsers.subscribe(users => {
            if (users.length > 0) {
                let user = users[0];
                let uberOAuth2Response: Observable<Response> = this.uberRequestService
                    .getOAuth2(uberPath, uberParams, user);
                uberOAuth2Response.subscribe(r => {
                    console.log('Handling OAuth2 Uber API call');
                    if (r) {
                        this.uberOAuthString = r.status + ' ' + r.statusText;
                        if (r.json()) {
                            let s_json = JSON.stringify(r.json());
                            if (s_json.length > 128) {
                                s_json = s_json.slice(0, 127) + " ...";
                            }
                            this.uberOAuthString = this.uberOAuthString + ': ' + s_json;
                        }
                    } else { // Start with completely new token
                        let t_request = <TokenDataRequestParams>({ serviceName: 'uber',
                                                                   path: '/uber_token/',
                                                                   id: user.uber_token });
                        let obsUberTokens = this.userTokenService.getUserToken(t_request);
                        obsUberTokens.subscribe(tokens => {
                            if (tokens.length > 0) {
                                let state = tokens[0].auth_uuid;
                                this.router.navigate(['/uberauth'], { queryParams: {state: state} });
                            }
                        });
                    }
                });
            }
        });
        console.log("...done.");
    }

}
