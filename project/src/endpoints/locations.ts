import { Request, Response } from 'express';
import { locationsExampleApp } from '../exampleApp';
import logger from '../logger';

const locations = async (req: Request, res: Response) => {
  logger.info(`Locations request`);

  const locations = await locationsExampleApp();

  res.send(locations);
};

export default locations;
