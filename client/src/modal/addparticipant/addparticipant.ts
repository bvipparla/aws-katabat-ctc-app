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
  slideOneForm2: FormGroup;
  slideTwoForm: FormGroup;
  masks: any;

  submitAttempt: boolean = false;

  displayFormat:string = 'YYYY-MM-DD'
  participant:IParticipant = {
    Id: UUID.v4(),
    yyyy: 2018,
    type: ParticipantType.DONOR,
    info: {
      InName: 'CTChallenge2018',
      fName: 'TestFname',
      lName: 'Test LName',
      cName: 'Test Company Name',
      email: 'acb@gmail.com',
      address: {
        line1: 'al1',
        line2: 'al2',
        city: 'city',
        state: 'st',
        zipCode: '1234',
        country: 'CT'
      },
      registration: {
        type: '12',
        on: '123'
      }
    },
    donor: {
      id: '12'
    },
    rider: {
      id: '123'
    },
    vol: {
      location: '12',
      from: '12',
      to: '12',
      comments: '12',
      priorExp: '21',
      cancerSurvivor: false,
      tShirt: 'xxl'
    },
    donation: {
      qty: 0,
      type: DonationType.Amount,
      method: 'Payment'
    },
    createdOn: '12',
    createdBy: '12'
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public auth: AuthService,
    private participantStore: ParticipantStore,
    public formBuilder: FormBuilder
  ) {
    this.slideOneForm = formBuilder.group({
        fName: ['', Validators.compose([Validators.maxLength(20), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        lName: ['', Validators.compose([Validators.maxLength(20), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        cName: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*')])],
        email: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        age: ['', AgeValidator.isValid],
        dob: ['', Validators.compose([Validators.required])],
        addressLine1: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        phoneNumber: ['']
    });

    this.masks = {
            phoneNumber: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
            cardNumber: [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
            cardExpiry: [/[0-1]/, /\d/, '/', /[1-2]/, /\d/]
          };

    this.slideOneForm2 = formBuilder.group({
        addressLine1: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        addressLine2: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        city: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        state: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        country: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
        zipcode: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])]
    });

    this.slideTwoForm = formBuilder.group({
        username: ['', Validators.compose([Validators.required, Validators.pattern('[a-zA-Z]*')]), UsernameValidator.checkUsername],
        privacy: ['', Validators.required],
        bio: ['']
    });
  }

  ionViewDidLoad() {}

  addParticipant () {
    this.participant.createdOn = moment(new Date()).format(this.displayFormat)
    this.participantStore.addParticipant(this.participant).subscribe(participant => {
      if (participant) {
        this.dismiss(participant)
      } else {
        console.log('Could not add participant. Please see logs')
      }
    })
  }

  next(){
    this.addParticipantSlider.slideNext();
  }

  prev(){
    this.addParticipantSlider.slidePrev();
  }

  save(){
    this.submitAttempt = true;

    if(!this.slideOneForm.valid){
        this.addParticipantSlider.slideTo(0);
    }
    else if(!this.slideTwoForm.valid){
        this.addParticipantSlider.slideTo(1);
    }
    else {
        console.log("success!")
        console.log(this.slideOneForm.value);
        console.log(this.slideTwoForm.value);
    }
  }

  dismiss (data?:any) { this.viewCtrl.dismiss(data) }
}
