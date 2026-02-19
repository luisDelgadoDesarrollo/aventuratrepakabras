export interface ImageRequestDto {
  image: string
  description?: string | null
}

export interface CreateArticleVariantDto {
  size: string
  color?: string | null
  stock?: number | null
  images: ImageRequestDto[]
}

export interface CreateArticleRequestDto {
  title: string
  description?: string | null
  images: ImageRequestDto[]
  variants: CreateArticleVariantDto[]
}

export interface ArticleVariantDto {
  articleId: number
  articleVariantId: number
  size: string
  color?: string | null
  stock?: number | null
  images: string[]
}

export interface ArticleDto {
  clubId: number
  slug: string
  articleId: number
  title: string
  description?: string | null
  imagePath: string[]
  variants: ArticleVariantDto[]
}
