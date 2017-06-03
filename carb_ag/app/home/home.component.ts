import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/expand'
import 'rxjs/add/observable/from'

import { User } from '../_models/index';
import { UserService } from '../_services/index';
import { UserTokenData } from '../_models/index';
import { UserTokenService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
    userData: User[] = [];
    tokenData: UserTokenData[] = [];
    userTokens: 'Tokens:'; // for the template

    constructor(private userService: UserService,
                private userTokenService: UserTokenService) { }

    ngOnInit() {
        console.log("At user home:");
        console.log("Connecting to user API...");
        let observedUsers = this.userService.getUsers();
        observedUsers.subscribe(users => {
            // update template
            this.userData = users;
        });
        console.log("...done.");
        console.log("Connecting to token API...");
        let tokenRequesters = observedUsers.expand(users => {
            return Observable.from(users);
        });
        let observedTokens = tokenRequesters.flatMap(this.userTokenService.getUserTokens);
        observedTokens.subscribe(tokens => {
            this.tokenData = tokens;
        });
        console.log("...done.");
    }
}
