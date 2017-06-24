import { Component, OnInit } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'

import { User } from '../_models/index';
import { UserTokenData } from '../_models/index';
import { TokenDataRequestParams } from '../_models/index';
import { TokenDataSearchParams } from '../_models/index';
import { UserService } from '../_services/index';
import { UserTokenService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'uber.auth.component.html'
})

export class UberAuthComponent implements OnInit {
    // for the template
    userData: User[] = [];
    userString: string = "";
    tokenData: UserTokenData[] = [];
    tokenStrings: string[] = [];
    uberString: string;

    getAuth: boolean;
    authURL: string;

    constructor(private userService: UserService,
                private userTokenService: UserTokenService) { }

    ngOnInit() {
        console.log("At Uber auth:");
        let client_id = "8mbR_i3W8ekCHYeb4xcCKbi__9OLx2pu";
        let redirect_uri = "https://127.0.0.1:4200/uberauth";

        // determine if blank (creating auth) or filled (redirect receiving auth)
        let urlParams = getAllURLParams(null);
        console.log('Current parameters:');
        console.log(urlParams);

        this.getAuth = !(urlParams['auth_code']);
        if (this.getAuth) {
            console.log('Redirecting to Uber authorization...');
            let authParams = new URLSearchParams();
            authParams.set('response_type', 'code');
            authParams.set('client_id', client_id);
            authParams.set('state', urlParams['state']);
            authParams.set('redirect_uri', redirect_uri);
            let urlbase = 'https://login.uber.com';
            let path = '/oauth/v2/authorize';
            let url = urlbase + path + '?' + authParams;
            this.authURL = url;
        } else {
            console.log('Saving user authorization...');
            // strip '-' for db query
            let state = urlParams['state'].replace('-', '');
            let s_params: TokenDataSearchParams = <TokenDataSearchParams>({
                serviceName: 'uber', path: '/uber_token/', authUuid: state
            });
            console.log('Retrieving partial token...');
            let observedTokens: Observable<UserTokenData[]> = this.userTokenService.getUserTokenByUuid(s_params);
            observedTokens.subscribe(tokens => {
                if (tokens.length > 0) {
                    console.log('Updating token with new code...');
                    let t = tokens[0];
                    let t_params: TokenDataRequestParams = <TokenDataRequestParams>({
                        serviceName: 'uber', path: '/uber_token/', id: t.id[0]
                    });
                    let t_final = <UserTokenData>({
                        serviceName: t.serviceName,
                        id: t.id,
                        access_token: t.access_token,
                        refresh_token: t.refresh_token,
                        access_token_exp: t.access_token_exp,
                        auth_uuid: t.auth_uuid,
                        auth_code: urlParams['code'],
                        auth_scope: t.auth_scope,
                        owner: t.owner,
                        updated: t.updated
                    });
                    let updatedToken: Observable<UserTokenData[]> = this.userTokenService
                        .saveToken(t_params, t_final);
                    updatedToken.subscribe(tokens => {
                        if (tokens.length > 0) {
                            console.log('Updated matching tokens.');
                        }
                    });
                    console.log('...done');
                }
            });
        }
    }
}

// ref: sitepoint.com/get-url-parameters-with-javascript/
function getAllURLParams(url) {
  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {
    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}
