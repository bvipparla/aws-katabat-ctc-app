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
  zipCode:string
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
  priorExp:string
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
  InName:string
  fName:string
  lName:string
  cName:string
  email:string
  address:IAddress
  phone?:Array<IPhone>
  registration:IRegistrationInfo
}

export interface IParticipant {
  Id:string
  yyyy:number
  type:ParticipantType
  info:IGeneralInfo
  donor:IDonorInfo
  rider:IRiderInfo
  vol:IVolunteerInfo
  donation:IDonation
  createdOn?:string
  createdBy:any
}
