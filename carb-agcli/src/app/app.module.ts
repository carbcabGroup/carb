import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { AppComponent }  from './app.component';
import { routing }       from './app.routing';

import { AuthGuard }     from './_guards/index';
import { AuthenticationService,
         UserService,
         UserConnectionService,
         UserTokenService,
         UberOAuth2Service,
         UberRequestService } from './_services/index';
import { LoginComponent }     from './login/index';
import { HomeComponent }      from './home/index';
import { UberAuthComponent }  from './uberauth/index';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        routing
    ],
    declarations: [
        AppComponent,
        LoginComponent,
        HomeComponent,
        UberAuthComponent
    ],
    providers: [
        AuthGuard,
        AuthenticationService,
        UserService,
        UserTokenService,
        UserConnectionService,
        UberOAuth2Service,
        UberRequestService
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }
