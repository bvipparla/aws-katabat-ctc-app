import { Component } from '@angular/core'

import { NavController } from 'ionic-angular'
import { ModalController } from 'ionic-angular'
import { ToastController } from 'ionic-angular'
import 'rxjs/add/operator/debounceTime'

import { FormControl } from '@angular/forms'
import { AuthService } from '../../app/auth.service'
import { AddParticipantModal } from '../../modal/addparticipant/addparticipant'
import { ParticipantStore } from '../../app/models/participant.store'
import { IParticipant } from '../../app/models/participant.interface'

@Component({
  selector: 'page-participants',
  templateUrl: 'participants.html'
})
export class ParticipantsPage {
  searchControl: FormControl
  searchTerm: string = ''
  searching: any = false

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private participantStore: ParticipantStore
  ) {
    this.searchControl = new FormControl()
  }

  ionViewDidLoad() {
    this.searchControl.valueChanges.debounceTime(500).subscribe(search => {
      let subscription = this.participantStore.refresh(search).subscribe({
        complete: () => {
          this.searching = false
          subscription.unsubscribe()
        }
      })
    })

    //For the initial refresh ...
    this.searching = true
    let subscription = this.participantStore.refresh().subscribe({
      complete: () => {
        subscription.unsubscribe()
        this.searching = false
      }
    })
  }

  onSearchInput(){
    this.searching = true
  }

  doRefresh (refresher) {
    console.log('refreshing...')
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
