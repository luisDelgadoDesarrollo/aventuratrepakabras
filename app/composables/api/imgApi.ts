export const useImagesVersion = () => useState<number>("images_version", () => 0)

export const bumpImagesVersion = () => {
    const version = useImagesVersion()
    version.value = Date.now()
}

export const getImageUrl = (filename: string) => {
    const config = useRuntimeConfig()
    const version = useImagesVersion()
    if (!filename) return filename

    const withVersion = (url: string) => {
        if (!version.value) return url
        const separator = url.includes("?") ? "&" : "?"
        return `${url}${separator}v=${version.value}`
    }

    // If backend already returns a full/ready URL or path, do not prefix it again.
    if (
        filename.startsWith("http://") ||
        filename.startsWith("https://") ||
        filename.startsWith("/api/images/") ||
        filename.startsWith("/images/") ||
        filename.startsWith("/")
    ) {
        return withVersion(filename)
    }

    return withVersion(`${config.public.apiBase}/images/${filename}`)
}
