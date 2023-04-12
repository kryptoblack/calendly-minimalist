import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    failOnErrors: true,
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Calendly Minimalist',
            version: '1.0.0',
        },
        components: {
            schemas: {
                ResponseMessageSchema: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'The Server is Working!',
                            description: 'Returns a mysterious string.',
                            required: true,
                            nullable: false
                        }
                    }
                },
                ResponseTokenSchema: {
                    type: 'object',
                    properties: {
                        access_token: {
                            type: 'string',
                            description: 'Access token.',
                            required: true,
                            nullable: false
                        },
                        refresh_token: {
                            type: 'string',
                            description: 'Refresh token.',
                        }
                    }
                },
            }
        }
    },
    apis: ['./src/index.*'], // files containing annotations as above
};

export const openapiSpecification = swaggerJsdoc(options);
