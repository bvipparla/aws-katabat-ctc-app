import { NgModule, ErrorHandler } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { HttpModule } from '@angular/http'
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { MyApp } from './app.component'

import { ParticipantsPage } from '../pages/participants/participants'
import { HomePage } from '../pages/home/home'
import { TabsPage } from '../pages/tabs/tabs'
import { LoginModal } from '../modal/login/login'
import { LogoutModal } from '../modal/logout/logout'
import { AddParticipantModal } from '../modal/addparticipant/addparticipant'

import { AwsConfig } from './app.config'
import { AuthService, AuthServiceProvider } from './auth.service'
import { ProjectStore, ProjectStoreProvider } from './project.store'
import { ParticipantStore, ParticipantStoreProvider } from './models/participant.store'
import { Sigv4Http, Sigv4HttpProvider } from './sigv4.service'

import { ChartsModule } from 'ng2-charts'
import { momentFromNowPipe } from './momentFromNow.pipe'

import { TextMaskModule } from 'angular2-text-mask'

import { SearchProvider } from '../providers/SearchProvider';

@NgModule({
  declarations: [
    MyApp,
    ParticipantsPage,
    HomePage,
    TabsPage,
    LoginModal,
    LogoutModal,
    AddParticipantModal,
    momentFromNowPipe
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp, new AwsConfig().load()),
    FormsModule,
    ChartsModule,
    TextMaskModule,
    ReactiveFormsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ParticipantsPage,
    HomePage,
    TabsPage,
    LoginModal,
    LogoutModal,
    AddParticipantModal
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService, AuthServiceProvider,
    ProjectStore, ProjectStoreProvider,
    ParticipantStore, ParticipantStoreProvider,
    Sigv4Http, Sigv4HttpProvider,
    SearchProvider
  ]
})
export class AppModule {}
