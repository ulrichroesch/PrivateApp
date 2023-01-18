import compression from 'compression';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { APPLICATION_CONFIG } from './config';
import config from './endpoints/config';
import error from './endpoints/error';
import fetch from './endpoints/fetch';
import install from './endpoints/install';
import locations from './endpoints/locations';
import route from './endpoints/route';
import send from './endpoints/send';
import uninstall from './endpoints/uninstall';
import update from './endpoints/update';
import logger from './logger';
import { checkAuthorization } from './middleware/authorization';
import { errorHandler, exceptionHandler } from './middleware/errorHandler';

const app = express();
app.disable('x-powered-by');
app.use(express.static('static'));

app.use(helmet()); // set well-known security-related HTTP headers
app.use(cors({ origin: ['http://localhost:4200', 'https://ds-experimental-route-planner-application.azurewebsites.net'], credentials: true, methods: 'GET, OPTIONS, POST' }));
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => res.send(APPLICATION_CONFIG.name + ' v' + APPLICATION_CONFIG.version));

app.use(checkAuthorization);

app.get('/config', exceptionHandler(config));
app.put('/install', exceptionHandler(install));
app.patch('/update/:assetId', exceptionHandler(update));
app.delete('/uninstall/:assetId', exceptionHandler(uninstall));
app.post('/send/:assetId', exceptionHandler(send));
app.get('/fetch/:assetId', exceptionHandler(fetch));
app.post('/error', exceptionHandler(error));
app.get('/locations', exceptionHandler(locations));
app.get('/route', exceptionHandler(route));

app.use(errorHandler);
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => logger.info('Starting application on http://localhost:' + PORT));
