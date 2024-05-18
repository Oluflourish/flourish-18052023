export default interface IToken {
    id: number;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
