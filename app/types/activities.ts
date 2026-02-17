import type { ImageRequestDto } from "~/types/images"

export interface ActivityResponseDto {
    activityId?: number
    title: string
    slug: string
    description?: string
    affiliatePrice: number
    noAffiliatePrice?: number
    startDate: string
    endDate?: string
    imagesPath: string[]
}

export interface CreateActivityRequestDto {
    title: string
    description?: string
    affiliatePrice: number
    noAffiliatePrice?: number
    startDate: string
    endDate?: string
    images: ImageRequestDto[]
}
