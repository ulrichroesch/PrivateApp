import { Request, Response } from 'express';
import { routeExampleApp } from '../exampleApp';
import logger from '../logger';

const route = async (req: Request, res: Response) => {
  logger.info(`Route request`);

  const route = await routeExampleApp();

  res.send(route);
};

export default route;
