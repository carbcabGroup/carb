import { Component, OnInit } from '@angular/core';

import { User } from '../_models/index';
import { UserTokenData } from '../_models/index';
import { UserTokenService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
    userTokens: User[] = [];

    constructor(private userTokenService: UserTokenService) { }

    ngOnInit() {
        console.log("At user home:");
        this.userTokenService.getUserTokens()
            .subscribe(userTokens => {
                this.userTokens = userTokens;
            });
    }

}
