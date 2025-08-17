import swaggerJsdoc from 'swagger-jsdoc';

// AUDIT:Tech Stack -> Swagger/OpenAPI

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'EasywaysSkills API', version: '1.0.0' },
    paths: {
      '/api/auth/register': {
        post: {
          summary: 'Register',
          responses: { '201': { description: 'Created' } }
        }
      },
      '/api/auth/login': {
        post: { summary: 'Login', responses: { '200': { description: 'OK' } } }
      },
      '/api/auth/refresh-token': {
        post: { summary: 'Refresh token', responses: { '200': { description: 'OK' } } }
      },
      '/api/auth/logout': {
        post: { summary: 'Logout', responses: { '200': { description: 'OK' } } }
      },
      '/api/auth/forgot-password': {
        post: { summary: 'Forgot password', responses: { '200': { description: 'OK' } } }
      },
      '/api/auth/reset-password': {
        post: { summary: 'Reset password', responses: { '200': { description: 'OK' } } }
      },
      '/api/users/profile': {
        get: { summary: 'Get profile', responses: { '200': { description: 'OK' } } },
        put: { summary: 'Update profile', responses: { '200': { description: 'OK' } } }
      },
      '/api/users/upload-avatar': {
        post: { summary: 'Upload avatar', responses: { '200': { description: 'OK' } } }
      },
      '/api/users/dashboard': {
        get: { summary: 'User dashboard', responses: { '200': { description: 'OK' } } }
      },
      '/api/courses': {
        get: { summary: 'List courses', responses: { '200': { description: 'OK' } } }
      },
      '/api/courses/{id}': {
        get: {
          summary: 'Get course',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'OK' } }
        }
      },
      '/api/cart': {
        get: { summary: 'Get cart', responses: { '200': { description: 'OK' } } }
      },
      '/api/cart/add': {
        post: { summary: 'Add to cart', responses: { '200': { description: 'OK' } } }
      },
      '/api/cart/remove/{courseId}': {
        delete: {
          summary: 'Remove from cart',
          parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'OK' } }
        }
      },
      '/api/orders/create': {
        post: { summary: 'Create order', responses: { '200': { description: 'OK' } } }
      },
      '/api/orders/{orderId}/confirm-payment': {
        post: {
          summary: 'Confirm payment',
          parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'OK' } }
        }
      }
    }
  },
  apis: []
};

export const swaggerSpec = swaggerJsdoc(options);
