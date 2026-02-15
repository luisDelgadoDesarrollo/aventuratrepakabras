import type {ImageRequestDto} from "~/types/images";

export interface PublicationLinkDto {
    linkId: number
    publicationId: number
    title: string
    link: string
}


export interface LinkRequestDto {
    title: string
    link: string
}

export interface CreatePublicationRequestDto {
    title: string
    text: string
    images: ImageRequestDto[]
    links: LinkRequestDto[]
}

export interface PublicationResponseDto {
    publicationId: number
    slug: string
    clubId: number
    title: string
    text: string
    links: PublicationLinkDto[]
    createdAt: string
    imagesPath: string[]
}
