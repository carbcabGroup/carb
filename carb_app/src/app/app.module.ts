import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from '@angular/http';

import { MyApp } from './app.component';
import { DTokenProvider } from '../providers/d-token/d-token';
import { UserProvider } from '../providers/user/user';
import { UserServiceProvider } from '../providers/user-service/user-service';
import { UserTokenProvider } from '../providers/user-token/user-token';
import { UberRequestProvider } from '../providers/uber-request/uber-request';
import { UberOauth2Provider } from '../providers/uber-oauth2/uber-oauth2';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DTokenProvider,
    UserProvider,
    UserServiceProvider,
    UserTokenProvider,
    UberRequestProvider,
    UberOauth2Provider,
  ]
})
export class AppModule {}
