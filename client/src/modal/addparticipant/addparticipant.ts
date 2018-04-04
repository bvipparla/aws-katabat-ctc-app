import { Component, ViewChild } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, NavParams, ViewController } from 'ionic-angular'
import { AuthService } from '../../app/auth.service'
import { IParticipant, DonationType, ParticipantType } from '../../app/models/participant.interface'
import { ParticipantStore } from '../../app/models/participant.store'
import * as moment from 'moment'
import UUID from 'uuid'

import { AgeValidator } from  '../../app/validators/age';
import { UsernameValidator } from  '../../app/validators/username';

@Component({
  selector: 'modal-addparticipant',
  templateUrl: 'addparticipant.html'
})
export class AddParticipantModal {

  @ViewChild('addParticipantSlider') addParticipantSlider: any

  slideOneForm: FormGroup;
  slideTwoForm: FormGroup;
  masks: any;

  submitAttempt: boolean = false;

  displayFormat:string = 'YYYY-MM-DD'

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public auth: AuthService,
    private participantStore: ParticipantStore,
    public formBuilder: FormBuilder
  ) {
    this.masks = {
      phoneNumber: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
      cardNumber: [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
      cardExpiry: [/[0-1]/, /\d/, '/', /[1-2]/, /\d/]
    };
    this.slideOneForm = formBuilder.group({
      Id: UUID.v4(),
      yyyy: 2018,
      type: [ParticipantType.DONOR],
      InName: ['CTChallenge2018', Validators.compose([Validators.maxLength(20), Validators.pattern('[a-zA-Z0-9 ]*')])],
      fName: ['', Validators.compose([Validators.maxLength(20), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      lName: ['', Validators.compose([Validators.maxLength(20), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      cName: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*')])],
      email: ['', Validators.compose([Validators.maxLength(30), Validators.email, Validators.required])],
      dob: ['', Validators.compose([Validators.required])],
      age: ['20', AgeValidator.isValid],
      fullName: [''],
      phone: ['1234567890'],
      address: formBuilder.group({
        line1: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        line2: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        city: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        state: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        zipcode: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        country: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])]
      }),
      registration: formBuilder.group({
        type: ['Booth'],
        on: ['Today']
      }),
      vol: formBuilder.group({
        priorExp: [false],
        cancerSurvivor: [false],
        tShirt: ['m'],
        comments: [null],
      }),
      donation: formBuilder.group({
        qty: [''],
        type: [''],
        method: ['']
      }),
      updated: 1
    });

    this.slideTwoForm = formBuilder.group({
        username: ['Test', Validators.compose([Validators.required, Validators.pattern('[a-zA-Z]*')]), UsernameValidator.checkUsername],
        privacy: ['test', Validators.required],
        bio: ['test']
    });
  }

  ionViewDidLoad() {}

  next(){
    this.addParticipantSlider.slideNext();
  }

  prev(){
    this.addParticipantSlider.slidePrev();
  }

  saveParticipant(participant: IParticipant, isValid: boolean) {
    this.submitAttempt = true;
    participant.phone = participant.phone.replace(/\D+/g, '')
    participant.fullName = participant.fName + ' ' + participant.lName
    if(!this.slideOneForm.valid){
        this.addParticipantSlider.slideTo(0);
    } else if(!this.slideTwoForm.valid){
        this.addParticipantSlider.slideTo(1);
    } else {
      this.submitAttempt = false;
      participant.createdOn = moment(new Date()).format(this.displayFormat)
      this.participantStore.addParticipant(participant).subscribe(participant => {
        if (participant) {
          this.dismiss(participant)
        } else {
          console.log('Could not add participant. Please see logs')
        }
      });
    }
  }

  dismiss (data?:any) { this.viewCtrl.dismiss(data) }
}
