export interface ContactRequestDto {
    name: string;
    email: string;
    message: string;
    phoneNumber: string;
}

export interface ClubContactDto{
    clubId?: number | null;
    contactEmail: string;
    phone?: string;
    phoneNumber?: string;
}
