export class UberTokenResponse {
    access_token: string;
    token_type: string; // 'Bearer' for Uber OAuth2
    expires_in: number;
    refresh_token: string;
    scope: string;
}
