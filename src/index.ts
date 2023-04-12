import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

import { Auth, accessTokenIsValid, Credentials } from './auth';
import { config } from './config';
import { openapiSpecification } from './swagger';
import { ResponseMessageSchema, TokenSchema } from './schemas';

const app: Express = express();
app.use(express.json());

/**
 * @openapi
 * /:
 *   get:
 *     description: Returns a mysterious string.
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseMessageSchema'
 */
app.get('/', (_: Request, res: Response) => {
    res.send(ResponseMessageSchema.parse({ message: 'The Server is Working!' }));
});

/**
 * @openapi
 * /auth/google:
 *   post:
 *     description: Authenticate with Google OAuth2.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResponseTokenSchema'
 *     responses:
 *       200:
 *         description: Authenticate with Google OAuth2 workflow.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseMessageSchema'
 *             example:
 *               message: https://accounts.google.com/o/oauth2/v2/auth
 *       201:
 *         description: Regenerate the access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseTokenSchema'
 *       204:
 *         description: Access token is valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseMessageSchema'
 *             example:
 *               message: Access token is valid.
 */
app.post('/auth/google', async (req: Request, res: Response) => {
    const accessToken = req.body?.access_token;
    const refreshToken = req.body?.refresh_token;
    console.log('Access token:', accessToken);
    console.log('Refresh token:', refreshToken);

    // If the access token is valid, return a 204.
    //if (accessToken && accessTokenIsValid(accessToken))
    //res.send(ResponseMessageSchema.parse({ message: 'Access token is valid.' }));

    // If the access token is not valid, but the refresh token is, regenerate the access token.
    const client: Auth = new Auth(refreshToken);
    if (refreshToken) {
        const response: Credentials = await client.getAccessToken();
        res.send(TokenSchema.parse(response));
    }

    // If neither the access token or refresh token are valid, return a 200.
    // The client will then redirect to the Google OAuth2 workflow.
    const response: string = await client.getAuthorizationUrl();
    res.send(ResponseMessageSchema.parse({ message: response }));
});

/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     description: Callback for Google OAuth2.
 *     parameters:
 *       - in: query 
 *         name: code
 *         description: The authorization code returned by Google OAuth2.
 *         required: true 
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Authenticate with Google OAuth2.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseMessageSchema'
 *           example:
 *             message: Token Saved
 */
app.get('/auth/google/callback', async (req: Request, res: Response) => {
    const client: Auth = new Auth();
    const { code } = req.query;

    try {
        const tokens: Credentials = await client.getTokens(code as string);
        console.log(tokens);
        res.cookie('access_token', tokens.access_token);
        res.cookie('refresh_token', tokens.refresh_token);
    } catch (e) {
        console.log(e);
        res.send(ResponseMessageSchema.parse({ message: 'Failed to authenticate!' }));
        return;
    }

    res.send(ResponseMessageSchema.parse({ message: 'Token Saved' }));
});


if (config.node === 'development') {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));
}

app.listen(config.app.port, () => {
    console.log(`[server]: Server is running at http://localhost:${config.app.port}`);
});
