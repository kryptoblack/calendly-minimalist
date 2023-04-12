import { google } from 'googleapis';
import { Credentials } from 'google-auth-library';
import { config } from './config';

function accessTokenIsValid(accessToken: string): boolean {
    if (accessToken !== undefined && accessToken !== null && accessToken.split('.').length < 3) {
        const parts: string[] = accessToken.split('.');
        const body: any = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        const now: number = Math.floor(Date.now() / 1000);
        if (body.exp > now)
            return true;
    }

    return false;
}

class Auth {
    private readonly client = new google.auth.OAuth2(
        config.google.clientId,
        config.google.clientSecret,
        config.google.redirectUrl,
    );

    constructor(refreshToken?: string) {
        this.client.setCredentials({
            refresh_token: refreshToken,
        });
    }

    async getAuthorizationUrl(): Promise<string> {
        const authUrl = this.client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/calendar',
            ],
        });
        return authUrl;
    }

    async getTokens(code: string): Promise<Credentials> {
        const { tokens } = await this.client.getToken(code);
        return tokens;
    }

    async getAccessToken(): Promise<Credentials> {
        const { credentials } = await this.client.refreshAccessToken();
        return credentials;
    }

    async setCredentials(tokens: Credentials): Promise<void> {
        this.client.setCredentials(tokens);
    }

    getCalendarApi(): typeof google.calendar_v3.Calendar {
        return google.calendar({ version: 'v3', auth: this.client });
    }
}

export {
    Auth,
    Credentials,
    accessTokenIsValid,
};
