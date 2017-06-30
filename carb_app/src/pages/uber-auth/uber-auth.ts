import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'

import { User } from '../../models/index';
import { UserTokenData } from '../../models/index';
import { TokenDataRequestParams } from '../../models/index';
import { TokenDataSearchParams } from '../../models/index';

import { UserProvider } from '../../providers/user/user';
import { UserTokenProvider } from '../../providers/user-token/user-token';

/**
 * Generated class for the UberAuthPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-uber-auth',
  templateUrl: 'uber-auth.html',
})
export class UberAuthPage {
    userData: User[] = [];
    userString: string = "";
    tokenData: UserTokenData[] = [];
    tokenStrings: string[] = [];
    uberString: string;

    getAuth: boolean;
    authURL: string;

    constructor(public navCtrl: NavController, 
                public navParams: NavParams,
                private userService: UserProvider,
                private userTokenService: UserTokenProvider) {
    }

    ionViewDidLoad() {
        //console.log('ionViewDidLoad UberAuthPage');
    }

}
