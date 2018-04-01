import { Component } from '@angular/core'

import { NavController } from 'ionic-angular'
import { ModalController } from 'ionic-angular'
import { ToastController } from 'ionic-angular'

import { AuthService } from '../../app/auth.service'
import { AddParticipantModal } from '../../modal/addparticipant/addparticipant'
import { ParticipantStore } from '../../app/models/participant.store'
import { IParticipant } from '../../app/models/participant.interface'

@Component({
  selector: 'page-tasks',
  templateUrl: 'tasks.html'
})
export class TasksPage {

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private participantStore: ParticipantStore
  ) {}

  ionViewDidLoad() {}

  doRefresh (refresher) {
    let subscription = this.participantStore.refresh().subscribe({
      complete: () => {
        subscription.unsubscribe()
        refresher.complete()
      }
    })
  }

  openModal () {
    let modal = this.modalCtrl.create(AddParticipantModal, null, { cssClass : 'participantModal'
    })
    modal.onDidDismiss((participant : IParticipant) => {
      if (participant && participant.Id) {
        this.presentToast(`"${participant.Id}" was created.`)
      }
    })
    modal.present()
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 1500,
      position: 'bottom'
    })
    toast.onDidDismiss(() => { console.log('Dismissed toast') })
    toast.present()
  }

  get size() { return this.participantStore.participants.map((participants) => participants.size) }
}
