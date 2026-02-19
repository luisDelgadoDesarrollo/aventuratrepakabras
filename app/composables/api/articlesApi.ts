import { apiFetch } from "~/composables/api/apiClient"
import { appendFilesPart, appendJsonPart, type MultipartFiles } from "~/composables/api/multipart"
import { useAuth } from "~/composables/utils/auth"
import type { PageResponse } from "~/types/page"
import type { ArticleDto, CreateArticleRequestDto } from "~/types/articles"

const buildArticleFormData = (
  request: CreateArticleRequestDto,
  files: MultipartFiles = {}
) => {
  const formData = new FormData()
  appendJsonPart(formData, "article", request)
  appendFilesPart(formData, files, "files")

  return formData
}

export const getArticles = (page = 0, size = 10) => {
  const config = useRuntimeConfig()

  return apiFetch<PageResponse<ArticleDto>>(
    `/clubs/${config.public.clubSlug}/articles?page=${page}&size=${size}`
  )
}

export const getArticle = (articleId: number | string) => {
  const config = useRuntimeConfig()

  return apiFetch<ArticleDto>(
    `/clubs/${config.public.clubSlug}/articles/${articleId}`
  )
}

export const createArticle = async (
  request: CreateArticleRequestDto,
  files: MultipartFiles = {}
) => {
  const config = useRuntimeConfig()
  const { accessToken } = useAuth()
  const formData = buildArticleFormData(request, files)

  return await $fetch(
    `${config.public.apiBase}/clubs/${config.public.clubSlug}/articles`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      body: formData,
      credentials: "include"
    }
  )
}

export const updateArticle = async (
  articleId: string,
  request: CreateArticleRequestDto,
  files: MultipartFiles = {}
) => {
  const config = useRuntimeConfig()
  const { accessToken } = useAuth()
  const formData = buildArticleFormData(request, files)

  return await $fetch(
    `${config.public.apiBase}/clubs/${config.public.clubSlug}/articles/${articleId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      body: formData,
      credentials: "include"
    }
  )
}

export const deleteArticle = async (articleId: number) => {
  const config = useRuntimeConfig()
  const { accessToken } = useAuth()

  return await $fetch<void>(
    `${config.public.apiBase}/clubs/${config.public.clubSlug}/articles/${articleId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      credentials: "include"
    }
  )
}
