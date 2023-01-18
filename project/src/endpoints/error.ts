import { Request, Response } from 'express';
import { errorExampleApp } from '../exampleApp';
import logger from '../logger';
import { IErrorInput, IStatusResponse } from '../types';

const error = (req: Request, res: Response) => {
  const body = req.body as IErrorInput;

  logger.info('Error request');

  errorExampleApp(body);

  res.send({
    success: true,
  } as IStatusResponse);
};

export default error;
