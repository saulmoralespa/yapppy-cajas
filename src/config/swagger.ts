import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { Express } from 'express';
import path from 'path';

/**
 * Swagger configuration module
 * Separates API documentation concerns from business logic
 */
export class SwaggerConfig {
    /**
     * Setup Swagger UI for API documentation
     * @param app - Express application instance
     * @param swaggerPath - Path to swagger YAML file
     * @param docsRoute - Route where documentation will be served (default: /api-docs)
     */
    static setup(app: Express, swaggerPath: string, docsRoute: string = '/api-docs'): void {
        try {
            const swaggerDocument = YAML.load(swaggerPath);
            
            // Serve Swagger UI
            app.use(docsRoute, swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
                customCss: '.swagger-ui .topbar { display: none }',
                customSiteTitle: 'Yappy Payment API Documentation'
            }));

            console.log(`✓ Swagger documentation available at ${docsRoute}`);
        } catch (error) {
            console.error('Error loading Swagger documentation:', error);
            console.warn('API will continue without documentation');
        }
    }

    /**
     * Get absolute path to swagger file from project root
     */
    static getSwaggerPath(filename: string = 'Yappy-Checkout-integration.yml'): string {
        return path.resolve(process.cwd(), filename);
    }
}
