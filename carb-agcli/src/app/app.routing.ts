import { Routes, RouterModule } from '@angular/router';

import { UberAuthComponent } from './uberauth/index';
import { LoginComponent } from './login/index';
import { HomeComponent } from './home/index';
import { AuthGuard } from './_guards/index';

const appRoutes: Routes = [
    { path: 'uberauth', component: UberAuthComponent },
    { path: 'login', component: LoginComponent },
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
