import { Component } from '@angular/core'
import { HomePage } from '../home/home'
import { TasksPage } from '../tasks/tasks'
import { Platform } from 'ionic-angular'

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any = HomePage
  tab2Root: any = TasksPage
  tabsPlacement: string = 'bottom'
  tabsLayout: string = 'icon-top'

  constructor(
    public platform: Platform
  ) {
    if (!this.platform.is('mobile')) {
      this.tabsPlacement = 'top'
      this.tabsLayout = 'icon-left'
    }
  }
}
