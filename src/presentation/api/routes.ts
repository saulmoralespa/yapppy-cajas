import { Router } from "express";
import { ApiController } from "./controller";
/**
 * Application routes configuration
 * Handles business logic routing only
 * Documentation (Swagger) is configured separately in the server setup
 */
export class ApiRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new ApiController();
        router.post('/open-device', controller.openDevice);
        router.delete('/close-device', controller.closeDevice);
        router.post('/generate-qrcode/:type', controller.generateQRCode);
        router.get('/transaction/:transactionId', controller.getTransaction);
        router.put('/transaction/:transactionId', controller.cancelTransaction);

        return router;
    }
}