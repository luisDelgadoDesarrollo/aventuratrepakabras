export const getImageUrl = (filename: string) => {
    const config = useRuntimeConfig()
    return `${config.public.apiBase}/images/${filename}`
}