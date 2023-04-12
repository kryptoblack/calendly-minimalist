import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load the environment variables from the.env file
dotenv.config()


const serviceCredentials = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'service.json'), 'utf8')).installed;


export const config = {
    node: process.env.NODE_ENV ?? 'development',
    baseUrl: process.env.BASE_URL ?? 'http://localhost:8000',
    app: {
        port: process.env.PORT ?? '8000',
    },
    google: {
        get redirectUrl(): string { return config.baseUrl + '/auth/google/callback' },
        credentialsPath: path.join(process.cwd(), 'credentials'),
        serviceFilePath: path.join(process.cwd(), 'service.json'),
        clientId: serviceCredentials.client_id,
        clientSecret: serviceCredentials.client_secret,
    },
}
