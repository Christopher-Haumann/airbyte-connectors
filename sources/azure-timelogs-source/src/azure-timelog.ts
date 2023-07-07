import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {base64Encode, wrapApiError} from 'faros-airbyte-cdk';
import {chunk, flatten} from 'lodash';
import {VError} from 'verror';

//import {User, UserResponse, WorkItemResponse} from './models';
const DEFAULT_API_VERSION = '7.0';
const WORKITEM_IDS = [];
const MAX_BATCH_SIZE = 200;
export const DEFAULT_REQUEST_TIMEOUT = 60000;

export interface AzureTimelogConfig {
  readonly access_token: string;
  readonly organization: string;
  readonly project: string;
  readonly api_version?: string;
  readonly request_timeout?: number;
}

export class AzureTimelog {
  private static azure_Timelog: AzureTimelog = null;

  constructor(
    private readonly httpClient: AxiosInstance,
  ) {}

  static async instance(config: AzureTimelogConfig): Promise<AzureTimelog> {
    if (AzureTimelog.azure_Timelog) return AzureTimelog.azure_Timelog;

    if (!config.access_token) {
      throw new VError('access_token must not be an empty string');
    }

    if (!config.organization) {
      throw new VError('organization must not be an empty string');
    }

    if (!config.project) {
      throw new VError('project must not be an empty string');
    }

    const accessToken = base64Encode(`:${config.access_token}`);

    const version = config.api_version ?? DEFAULT_API_VERSION;
    const httpClient = axios.create({
      baseURL: `https://dev.azure.com/${config.organization}/${config.project}/_apis`,
      timeout: config.request_timeout ?? DEFAULT_REQUEST_TIMEOUT,
      maxContentLength: Infinity, //default is 2000 bytes
      params: {
        'api-version': version,
      },
      headers: {
        Authorization: `Basic ${accessToken}`,
      },
    });

    AzureTimelog.azure_Timelog = new AzureTimelog(httpClient);
    return AzureTimelog.azure_Timelog;
  }

  async checkConnection(): Promise<void> {
    try {
      const iter = this.getWorkItemsFromTimelogData();
      await iter.next();
    } catch (err: any) {
      let errorMessage = 'Please verify your access token is correct. Error: ';
      if (err.error_code || err.error_info) {
        errorMessage += `${err.error_code}: ${err.error_info}`;
        throw new VError(errorMessage);
      }
      try {
        errorMessage += err.message ?? err.statusText ?? wrapApiError(err);
      } catch (wrapError: any) {
        errorMessage += wrapError.message;
      }
      throw new VError(errorMessage);
    }
  }

  private get<T = any, R = AxiosResponse<T>>(
    path: string
  ): Promise<R | undefined> {
    return this.handleNotFound<T, R>(() => this.httpClient.get<T, R>(path));
  }

  private async handleNotFound<T = any, R = AxiosResponse<T>>(
    call: () => Promise<R>
  ): Promise<R | undefined> {
    try {
      const res = await call();
      return res;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return undefined;
      }
      throw err;
    }
  }
  async *getTimeLogData():AsyncGenerator<any>{
    const res = await this.get<any>('https://extmgmt.dev.azure.com/vwfs/_apis/ExtensionManagement/InstalledExtensions/TechsBCN/DevOps-TimeLog/Data/Scopes/Default/Current/Collections/TimeLogData/Documents?api-version=7.0-preview.1');
    
    for (const item of res.data?.value ?? []) {    
      WORKITEM_IDS.push(item?.workItemId);
      yield item;
    }
  }

  async *getWorkItemsFromTimelogData():AsyncGenerator<any>{
    let uniqueIds = [...new Set(WORKITEM_IDS)];
/*
     for (const c of chunk(uniqueIds, MAX_BATCH_SIZE)) {
        const res = await this.get<any>(`wit/workitems?ids=${c}&$expand=all`);
        for (const item of res?.data?.value ?? []) {
          yield item;
        }
      }
      */
     for(const id of uniqueIds){
        const workItem = await this.get<any>('wit/workitems/' + id + '?api-version=5.1')
        if(workItem == undefined){
          continue;
        }
        yield workItem?.data;
     }
  }

  async *getB2CworkitemsFromQuery():AsyncGenerator<any>{
    const res = await this.get<any>('wit/wiql/d9e7fc7f-1de8-48a7-8aab-80fed2bc02ac');
    const b2bWorkitemIds = []
    
    for (const item of res.data?.workItems ?? []) {  
      b2bWorkitemIds.push(item?.id);
    }
    for (const c of chunk(b2bWorkitemIds, MAX_BATCH_SIZE)) {
      const res = await this.get<any>(`wit/workitems?ids=${c}&$expand=all`);
      for (const item of res?.data?.value ?? []) {
        yield item;
      }
    }
  }
}
