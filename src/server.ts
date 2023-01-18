import compression from 'compression';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import { APPLICATION_CONFIG } from './config';
import config from './endpoints/config';
import error from './endpoints/error';
import fetch from './endpoints/fetch';
import install from './endpoints/install';
import send from './endpoints/send';
import uninstall from './endpoints/uninstall';
import update from './endpoints/update';
import logger from './logger';
import { checkAuthorization } from './middleware/authorization';
import { errorHandler, exceptionHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet()); // set well-known security-related HTTP headers
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by');

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

app.use(errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info('Starting application on http://localhost:' + PORT));
