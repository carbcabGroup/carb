import { Injectable } from '@angular/core';
import { HttpInterceptor } from '../../http-interceptor/http.interceptor';
import { Headers, URLSearchParams, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/observable/of'

import { User } from '../../models/index';
import { TokenDataRequestParams } from '../../models/index';
import { UserTokenData } from '../../models/index';
import { UberTokenResponse } from '../../models/index';

import { UserTokenProvider } from '../user-token/user-token';
import { UberOauth2Provider } from '../uber-oauth2/uber-oauth2';
/*
  Generated class for the UberRequestProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UberRequestProvider {

    constructor(public http: HttpInterceptor,
                private userTokenService: UserTokenProvider,
                private uberOAuth2Service: UberOauth2Provider) {
        console.log('Hello UberRequestProvider Provider');
    }

    get(path: string, params: URLSearchParams): Observable<Response> {
        let serverToken = 'EJ0pcAbk9USM4McsYzCLOkYphlnmxWvElOEdxV74';

        var url = 'https://sandbox-api.uber.com';
        //var url = 'https://api.uber.com';
        if (path.length > 0) {
            if (path[0] != '/') {
                url = url + '/';
            }
            url = url + path;
        }
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + serverToken
        });
        let options = new RequestOptions({ headers: headers, params: params });
        console.log('Calling Uber public API...');
        let apiResult: Observable<Response> = this.http.get(url, options).catch(this.handleError);
        console.log('Response info:');
        console.log(apiResult);
        return apiResult;
    }

    getOAuth2(path: string, params: URLSearchParams, user: User): Observable<Response> {
        console.log('Searching for user "' + user.username + '"\'s tokens');
        // Get existing tokens for current user
        let t_request = <TokenDataRequestParams>({ serviceName: 'uber',
                                                   path: '/uber_token/',
                                                   id: user.uber_token });
        let initObsTokens: Observable<UserTokenData[]> = this.userTokenService.getUserToken(t_request)
            .catch(this.handleError);
        let finalObsTokens: Observable<Observable<UserTokenData[]>> = initObsTokens.map(tokens => {
            if (tokens.length == 0) {
                console.log('Creating blank token');
                let newObsToken: Observable<UserTokenData[]> = this.userTokenService.makeEmptyToken(t_request)
                    .catch(this.handleError);
                // continue with fresh token
                return newObsToken;
            } else {
                // use original token
                return Observable.of(tokens);
            }
        }).catch(this.handleError);
        let userTokens: Observable<UserTokenData[]> = finalObsTokens.mergeAll();

        console.log('Using token');
        let observedResponses: Observable<Observable<Response>> = userTokens.map(tokenData => {
            if (tokenData.length > 0 && tokenData[0].access_token_exp) { // Has some token data
                console.log('Token contains access details');
                var token = tokenData[0];
                var t_now = new Date().getTime();
                var t_exp = new Date(token.access_token_exp).getTime();
                if (t_now < t_exp) { // Token still fresh
                    console.log('Using valid token');
                    let apiResponse: Observable<Response> = this.callAPI(token.access_token,
                                                                           path, params).catch(this.handleError);
                    return apiResponse;
                } else {
                    console.log('Refreshing token');
                    let t_issue = new Date();
                    let refreshResponse: Observable<UberTokenResponse[]> = this.uberOAuth2Service
                        .refreshToken(token.refresh_token)
                        .catch(this.handleError);
                    let obsApiResponse: Observable<Observable<Response>> = refreshResponse.map(resp => {
                        if (resp.length > 0) {
                            let t_exp = new Date(t_issue.getTime() + (resp[0].expires_in * 1000));
                            let freshToken: UserTokenData = <UserTokenData>({
                                serviceName: token.serviceName,

                                id: token.id,
                                access_token: resp[0].access_token,
                                refresh_token: resp[0].refresh_token,
                                access_token_exp: t_exp.toUTCString(),
                                auth_uuid: token.auth_uuid,
                                auth_code: token.auth_code,
                                auth_scope: resp[0].scope,
                                owner: token.owner,
                                updated: token.updated,
                            });
                            let saveResp: Observable<UserTokenData[]> = this.userTokenService
                                .saveToken(t_request, freshToken)
                                .catch(this.handleError);
                            console.log('Using valid refreshed token');
                            let obsApiResp: Observable<Observable<Response>> = saveResp.map(tokens => {
                                if (tokens.length > 0) {
                                    let apiResponse: Observable<Response> = this.callAPI(tokens[0].access_token,
                                                                                           path, params)
                                        .catch(this.handleError);
                                    return apiResponse;
                                } else { // failed
                                    return Observable.throw('Token update failed.');
                                }
                            }).catch(this.handleError);
                            let newApiResp: Observable<Response> = obsApiResp.mergeAll();
                            return newApiResp;
                        } else { // failed
                            return Observable.throw('Token refresh failed.');
                        }
                    }).catch(this.handleError);
                    let apiResp: Observable<Response> = obsApiResponse.mergeAll();
                    return apiResp;
                }
            } else { // Start with completely new token
                console.log('Token details are incomplete');
                if (tokenData.length == 0) {
                    return Observable.throw('Prior token creation failed.');
                }
                var token = tokenData[0];
                // use auth code to get token
                if (token.auth_code) {
                    console.log('Getting new token');
                    let t_issue = new Date();
                    let getResponse: Observable<UberTokenResponse[]> = this.uberOAuth2Service
                        .getToken(token.auth_code)
                        .catch(this.handleError);
                    let obsApiResponse: Observable<Observable<Response>> = getResponse.map(resp => {
                        if (resp.length > 0) {
                            let t_exp = new Date(t_issue.getTime() + (resp[0].expires_in * 1000));
                            let freshToken: UserTokenData = <UserTokenData>({
                                serviceName: token.serviceName,

                                id: token.id,
                                access_token: resp[0].access_token,
                                refresh_token: resp[0].refresh_token,
                                access_token_exp: t_exp.toUTCString(),
                                auth_uuid: token.auth_uuid,
                                auth_code: token.auth_code,
                                auth_scope: resp[0].scope,
                                owner: token.owner,
                                updated: token.updated,
                            });
                            let saveResp: Observable<UserTokenData[]> = this.userTokenService
                                .saveToken(t_request, freshToken)
                                .catch(this.handleError);
                            console.log('Using valid new token');
                            let obsApiResp: Observable<Observable<Response>> = saveResp.map(tokens => {
                                if (tokens.length > 0) {
                                    let apiResponse: Observable<Response> = this.callAPI(tokens[0].access_token,
                                                                                           path, params)
                                        .catch(this.handleError);
                                    return apiResponse;
                                } else { // failed
                                    return Observable.throw('Token update failed.');
                                }
                            }).catch(this.handleError);
                            let newApiResp: Observable<Response> = obsApiResp.mergeAll();
                            return newApiResp;
                        } else { // failed
                            return Observable.throw('Token request failed.');
                        }
                    }).catch(this.handleError);
                    let apiResp: Observable<Response> = obsApiResponse.mergeAll();
                    return apiResp;
                } else { // will fail; requires authorization redirect
                    console.log('Token access not yet authorized');
                    let apiResponse: Observable<Response> = this.callAPI("", path, params).catch(this.handleError);
                    return apiResponse;
                }
            }
        }).catch(this.handleError);
        let responses: Observable<Response> = observedResponses.mergeAll();
        return responses;
    }

    callAPI(token: string, path: string, params: URLSearchParams): Observable<Response> {
        //let urlbase = 'https://sandbox-api.uber.com';
        let urlbase = 'https://api.uber.com';
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        });
        let options = new RequestOptions({ headers: headers, params: params});

        console.log('Calling Uber OAuth2 API...');
        let url = urlbase + path;
        let resp: Observable<Response> = this.http.get(url, options).catch(this.handleError);
        return resp;
    }

    private handleError(error: any) {
        let msg = error.message || "Error accessing API.";
        console.error(msg);
        return Observable.throw(msg);
    }
}
