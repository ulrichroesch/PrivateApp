export interface ICustomField {
  type: 'text' | 'checbkox';
  key: string;
  displayName: string;
  required: boolean;
}

export enum ApplicationMode {
  FETCH = 'FETCH',
  SEND = 'SEND',
  SEND_FETCH_SYNC = 'SEND_FETCH_SYNC',
  SEND_FETCH_ASYNC = 'SEND_FETCH_ASYNC',
}
export interface IApplication {
  name: string;
  type: string;
  version: string;
  description: string;
  minSelectVariables: number;
  maxSelectVariables: number;
  customUserFields: ICustomField[];
  mode: ApplicationMode;
  backgroundColor: string;
  allowEditVariables: boolean;
  isCustomerAllowed: boolean;
}

/* TIME SERIES TYPES */
export interface ITimeSerie {
  value: number;
  timestamp: number;
}

export interface IVariableTimeSeries {
  variable: string;
  timeSeries: ITimeSerie[];
}

/* INPUT TYPES */

export interface ICustomFieldInput {
  key: string;
  value: string | number;
}

export interface IInstallInput {
  name: string;
  selectedVariables: string[];
  customUserFields: ICustomFieldInput[];
}

export interface IUpdateInput {
  name: string;
  selectedVariables: string[];
  customUserFields: ICustomFieldInput[];
}

export interface ISendInput {
  lastSendDate: number;
  variablesTimeSeries: IVariableTimeSeries[];
}

export interface IFetchInput {
  lastFetchDate: number;
}

export interface IErrorInput {
  errorMessage: string;
  assetId?: string;
  endpoint?: string;
}

/* RESPONSE TYPES */

export interface IStatusResponse {
  success: boolean;
  errorMessage?: string;
}

export interface IInstallResponse extends IStatusResponse {
  assetId: string;
}

export interface ISendResponse extends IStatusResponse {
  variablesTimeSeries?: IVariableTimeSeries[];
}

export interface IFetchResponse extends IStatusResponse {
  variablesTimeSeries?: IVariableTimeSeries[];
}
