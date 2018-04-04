export enum DonationType {Amount, Item}
export enum ParticipantType {DONOR, RIDER, VOLUNTEER}

interface IPhone {
  type:string
  number:string
}

interface IAddress {
  line1:string
  line2:string
  city:string
  state:string
  zipcode:string
  country:string
}

interface IRiderInfo {
  id:string
}

interface IDonorInfo {
  id:string
}

interface IVolunteerInfo {
  location:string
  from:string
  to:string
  comments:string
  priorExp:boolean
  cancerSurvivor:boolean
  tShirt:string
}

interface IRegistrationInfo {
  type:string
  on:string
}

interface IDonation {
  qty:number
  type:DonationType
  method:string
}

interface IGeneralInfo {

}

export interface IParticipant {
  Id:string
  yyyy:number
  type: Array<ParticipantType>
  InName:string
  fName:string
  lName:string
  cName:string
  fullName?: string
  email:string
  phone:string
  address:IAddress
  registration:IRegistrationInfo
  donor:IDonorInfo
  rider:IRiderInfo
  vol:IVolunteerInfo
  donation:IDonation
  createdOn?:string
  createdBy:any
  updated:number
}
