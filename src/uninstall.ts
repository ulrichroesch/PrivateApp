import { Request, Response } from 'express';
import { uninstallExampleApp } from '../exampleApp';
import logger from '../logger';
import { IStatusResponse } from '../types';

const uninstall = (req: Request, res: Response) => {
  const assetId = req.params.assetId;

  logger.info(`Uninstall application request: ${assetId}`);

  uninstallExampleApp(assetId);

  res.send({
    success: true,
  } as IStatusResponse);
};

export default uninstall;
