import express, { Router } from "express";
import cors from 'cors';
import { SwaggerConfig } from "../config";

interface Options {
    port?: number;
    routes: Router;
}

export class Server {

    public readonly app = express();
    private readonly port: number;
    private readonly routes: Router;

    constructor(options: Options) {
        const { port = 3000, routes } = options;

        this.port = port;
        this.routes = routes;
    }

    async start() {
        // Global middlewares
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));

        // Setup Swagger documentation
        SwaggerConfig.setup(
            this.app, 
            SwaggerConfig.getSwaggerPath()
        );

        // Register application routes
        this.app.use(this.routes);

        // Start server
        this.app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }
}