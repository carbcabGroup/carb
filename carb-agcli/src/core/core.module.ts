import { NgModule, Optional, SkipSelf } from '@angular/core';
import { AuthenticationService } from '../core/_services/index';

import { throwIfAlreadyLoaded } from './_guards/module.import.guard';

@NgModule({
    imports: [],
    declarations: [],
    providers: [
        AuthenticationService
    ]
})

export class CoreModule {
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        throwIfAlreadyLoaded(parentModule, 'CoreModule');
    }
}
