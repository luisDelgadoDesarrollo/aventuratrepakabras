export interface LoginRequestDto {
    username: string
    password: string
}

export interface TokenResponseDto {
    accessToken: string
    expiresIn: number
}