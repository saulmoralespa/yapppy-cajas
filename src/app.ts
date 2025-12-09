import { Server } from './presentation/server';
import { envs } from './config';
import { AppRoutes } from './presentation/routes';

(() => {
  main();
})()

async function main() {
  new Server({
    port: envs.PORT,
    routes: AppRoutes.routes
  }).start();
}

