import { Router } from "express";
import { ApiRoutes } from "./api/routes";

/**
 * Application routes configuration
 * Handles business logic routing only
 * Documentation (Swagger) is configured separately in the server setup
 */
export class AppRoutes {
    static get routes(): Router {
        const router = Router();

        router.use('/api', ApiRoutes.routes);

        // Business routes will be added here
        // TODO: Add payment routes, transaction routes, etc.

        return router;
    }
}