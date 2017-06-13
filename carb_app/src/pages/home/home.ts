import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
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
                public user: UserProvider
                ) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad HomePage');
        console.log("Connecting to user API...");
        let observedUsers = this.user.getUsers();
        observedUsers.subscribe(users => {
            // update template
            this.userData = users;
            this.userString = this.userData[0].username;
        });
        console.log("...done.");
        console.log("Connecting to token API...");
    }

}
