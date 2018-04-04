import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/concatAll'
import 'rxjs/add/operator/share'
import { List } from 'immutable'
import { IParticipant } from './participant.interface'
import { AuthService } from '../auth.service'
import * as moment from 'moment'
import * as _orderBy from 'lodash.orderby'
import { Sigv4Http } from '../sigv4.service'
import { Config } from 'ionic-angular'

let participantStoreFactory = (sigv4: Sigv4Http, auth: AuthService, config: Config) => { return new ParticipantStore(sigv4, auth, config) }

export let ParticipantStoreProvider = {
  provide: ParticipantStore,
  useFactory: participantStoreFactory,
  deps: [Sigv4Http, AuthService]
}

const displayFormat = 'YYYY-MM-DD'

@Injectable()
export class ParticipantStore {

  private _participants: BehaviorSubject<List<IParticipant>> = new BehaviorSubject(List([]))
  private endpoint:string

  constructor (private sigv4: Sigv4Http, private auth: AuthService, private config: Config) {
    this.endpoint = this.config.get('APIs')['ParticipantsAPI']
    this.auth.signoutNotification.subscribe(() => this._participants.next(List([])))
    this.auth.signinNotification.subscribe(() => this.refresh() )
  }

  get participants () { return Observable.create( fn => this._participants.subscribe(fn) ) }

  refresh (searchTerm?:string) : Observable<any> {
    if (this.auth.isUserSignedIn()) {
      let path = 'participants/2018'
      if(searchTerm){
        path += '?search=' + searchTerm
      }
      let observable = this.auth.getCredentials().map(creds => this.sigv4.get(this.endpoint, path, creds)).concatAll().share()
      observable.subscribe(resp => {
        console.log(resp)
        let data = resp.json()
        this._participants.next(List(this.sort(data.participants)))
      })
      return observable
    } else {
      this._participants.next(List([]))
      return Observable.from([])
    }
  }

  addParticipant (participant): Observable<IParticipant> {
    let observable = this.auth.getCredentials().map(creds => this.sigv4.post(this.endpoint, 'participants', participant, creds)).concatAll().share()

    observable.subscribe(resp => {
      if (resp.status === 201) {
        let participants = this._participants.getValue().toArray()
        let participant = resp.json().participant
        participants.push(participant)
        this._participants.next(List(participants))
      }
    })
    return observable.map(resp => resp.status === 201 ? resp.json().participant : null)
  }

  deleteTask (index): Observable<IParticipant> {
    let participants = this._participants.getValue().toArray()
    let obs = this.auth.getCredentials().map(creds => this.sigv4.del(this.endpoint, `participants/${participants[index].Id}`, creds)).concatAll().share()

    obs.subscribe(resp => {
      if (resp.status === 200) {
        participants.splice(index, 1)[0]
        this._participants.next(List(<IParticipant[]>participants))
      }
    })
    return obs.map(resp => resp.status === 200 ? resp.json().participant : null)
  }

  completeTask (index): Observable<IParticipant> {
    let participants = this._participants.getValue().toArray()
    let obs = this.auth.getCredentials().map(creds => this.sigv4.put(
      this.endpoint,
      `participants/${participants[index].Id}`,
      {completed: true, completedOn: moment().format(displayFormat)},
      creds)).concatAll().share()

    obs.subscribe(resp => {
      if (resp.status === 200) {
        participants[index] = resp.json().participant
        this._participants.next(List(this.sort(participants)))
      }
    })

    return obs.map(resp => resp.status === 200 ? resp.json().participant : null)
  }

  private sort (participants:IParticipant[]): IParticipant[] {
    return _orderBy(participants, ['completed', 'due'], ['asc', 'asc'])
  }
}
