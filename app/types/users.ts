export interface ClubUserDto {
  clubId: number
  nif: string
  federatedNumber?: string
  name: string
  surname: string
  email: string
  birthDate: string
  address: string
  city: string
  state: string
  postalCode: string
  phone: string
  homePhone: string
}

export interface CreateClubUserDto {
  nif: string
  federatedNumber?: string
  name: string
  surname?: string
  email: string
  birthDate: string
  address: string
  city: string
  state: string
  postalCode: string
  phone: string
  homePhone: string
}
