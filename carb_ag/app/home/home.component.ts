﻿import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'

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
    userString: string = "";
    tokenData: UserTokenData[] = [];
    tokenStrings: string[] = ['Tokens:', 'test', 'sample']; // for the template

    constructor(private userService: UserService,
                private userTokenService: UserTokenService) { }

    ngOnInit() {
        console.log("At user home:");
        console.log("Connecting to user API...");
        let observedUsers = this.userService.getUsers();
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
        let tokenRequesters = observedRequesters.mergeAll();
        let observedTokens = tokenRequesters.map(user => {
            return this.userTokenService.getUserTokens(user);
        });
        let userTokens = observedTokens.mergeAll();
        userTokens.subscribe(tokens => {
            this.tokenData = tokens;
        });
        console.log("...done.");
    }
}
