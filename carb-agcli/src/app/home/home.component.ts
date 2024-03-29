﻿import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { URLSearchParams, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'

import { User } from '../_models/index';
import { UserTokenData } from '../_models/index';
import { TokenDataRequestParams } from '../_models/index';
import { UserService } from '../_services/index';
import { UserTokenService } from '../_services/index';
import { UserConnectionService } from '../_services/index';
import { UberRequestService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
    // for the template
    userData: User[] = [];
    userString: string = "";
    tokenData: UserTokenData[] = [];
    tokenStrings: string[] = [];
    uberString: string;
    uberOAuthString: string;

    constructor(private router: Router,
                private userService: UserService,
                private userTokenService: UserTokenService,
                private userConnectionService: UserConnectionService,
                private uberRequestService: UberRequestService) { }

    ngOnInit() {
        console.log("At user home:");

        console.log("Connecting to user API...");
        let observedUsers: Observable<User[]> = this.userService.getUsers();
        observedUsers.subscribe(users => {
            // update template
            this.userData = users;
            this.userString = this.userData[0].username;
        });
        console.log("...done.");

        console.log("Connecting to token API...");
        // Consider replacing with flatMap
        let observedRequesters: Observable<Observable<User>> = observedUsers.map(users => {
            return Observable.from(users); // User[] -> Observable<User>
        });
        let tokenRequesters: Observable<User> = observedRequesters.mergeAll();
        let observedTokens: Observable<Observable<UserTokenData[]>> = tokenRequesters.map(user => {
            return this.userConnectionService.getUserTokens(user); // Observable<UserTokenData[]>
        });
        let userTokens: Observable<UserTokenData[]> = observedTokens.mergeAll();
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
                    console.log('Handling OAuth2 Uber API call response:');
                    console.log(r);
                    if (r.status == 200) {
                        this.uberOAuthString = r.status + ' ' + r.statusText;
                        if (r.json()) {
                            let s_json = JSON.stringify(r.json());
                            if (s_json.length > 128) {
                                s_json = s_json.slice(0, 127) + " ...";
                            }
                            this.uberOAuthString = this.uberOAuthString + ': ' + s_json;
                        }
                    } else if (r.status == 401) { // Start with completely new token
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
                    } else {
                        console.log('Unhandled response.');
                    }
                });
            }
        });
        console.log("...done.");
    }
}
