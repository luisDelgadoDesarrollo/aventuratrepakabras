import { apiFetch, apiFetchAuth, clubPath } from "~/composables/api/apiClient"
import { appendFilesPart, appendJsonPart, type MultipartFiles } from "~/composables/api/multipart"
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
  return apiFetch<PageResponse<ArticleDto>>(clubPath(`/articles?page=${page}&size=${size}`))
}

export const getArticle = (articleId: number | string) => {
  return apiFetch<ArticleDto>(clubPath(`/articles/${articleId}`))
}

export const createArticle = async (
  request: CreateArticleRequestDto,
  files: MultipartFiles = {}
) => {
  const formData = buildArticleFormData(request, files)

  return await apiFetchAuth<void>(
    clubPath("/articles"),
    {
      method: "POST",
      body: formData
    }
  )
}

export const updateArticle = async (
  articleId: string,
  request: CreateArticleRequestDto,
  files: MultipartFiles = {}
) => {
  const formData = buildArticleFormData(request, files)

  return await apiFetchAuth<void>(
    clubPath(`/articles/${articleId}`),
    {
      method: "PUT",
      body: formData
    }
  )
}

export const deleteArticle = async (articleId: number | string) => {
  return await apiFetchAuth<void>(
    clubPath(`/articles/${articleId}`),
    {
      method: "DELETE"
    }
  )
}
