import { z } from 'zod';

const ResponseMessageSchema = z.object({
    message: z.string(),
});

const TokenSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string().optional(),
});

export {
    ResponseMessageSchema,
    TokenSchema,
};
