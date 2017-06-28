import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UberAuthPage } from './uber-auth';

@NgModule({
  declarations: [
    UberAuthPage,
  ],
  imports: [
    IonicPageModule.forChild(UberAuthPage),
  ],
  exports: [
    UberAuthPage
  ]
})
export class UberAuthPageModule {}
