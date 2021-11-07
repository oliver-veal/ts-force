import axios from 'https://deno.land/x/axiod@0.20.0-0/mod.ts'
import { IAxiodResponse } from 'https://deno.land/x/axiod@0.20.0-0/interfaces.ts'

import { SObjectDescribe } from './sObjectDescribe.ts';
import { BaseConfig, ConfigParams, createConfig, DEFAULT_CONFIG } from '../auth/baseConfig.ts';
import type { Limits, ApiLimit, QueryResponse, SearchResponse, InvokableResult } from './restTypes.ts';
import { parseLimitsFromResponse } from './utils.ts';

export class Rest {
  private static defaultInstance: Rest;

    // @ts-ignore
  public config: BaseConfig;

    // @ts-ignore
  public request: typeof axios;
    // @ts-ignore
  public version: string;

  public apiLimit: ApiLimit = {
    // @ts-ignore
    used: null,
    // @ts-ignore
    limit: null
  };

  /**
   * Constructor
   * @param {BaseConfig} [config] Optional authentication configuration.
   *     If not passed in will return a "singleton" client from the default config
   * @memberof Rest
   */
  constructor(config?: ConfigParams) {
    if (config) {
      this.config = createConfig(config);
    } else {
      if (Rest.defaultInstance &&
        Rest.defaultInstance.config.accessToken === DEFAULT_CONFIG.accessToken) {
        return Rest.defaultInstance;
      }
      //should probably be refactored to just happen when the default config is set
      this.config = { ...DEFAULT_CONFIG };
      Rest.defaultInstance = this;
    }

    this.version = `v${(this.config.version ? this.config.version : DEFAULT_CONFIG.version).toFixed(1)}`;
    this.request = axios.create({
      baseURL: `${this.config.instanceUrl}`,
      headers: {
        'Authorization': 'Bearer ' + this.config.accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // maxContentLength: Infinity
    });

    // this.request.interceptors.response.use((response: IAxiodResponse) => {
    //   const limits = parseLimitsFromResponse(response);
    //   if (limits) {
    //     this.apiLimit = limits;
    //   }
    //   return response;
    // });
  }

  /**
   * @param  {string} apiName the object to get the describe for
   * @returns Promise<SObjectDescribe>
   */
  public async getSObjectDescribe(apiName: string): Promise<SObjectDescribe> {
    return (await this.request.get(`/services/data/${this.version}/sobjects/${apiName}/describe/`)).data;
  }

  /**
   * Executes any SOQL query
   * @param  {string} query SOQL Query to execute
   * @param  {string} allRows Optional boolean to indicate use of `queryall` endpoint
   * @returns Promise<QueryResponse<T>>
   */
  public async query<T>(query: string, allRows?: boolean): Promise<QueryResponse<T>> {
    let qryString = encodeURIComponent(query);
    return (await this.request.get(`/services/data/${this.version}/${allRows ? 'queryAll' : 'query'}?q=${qryString}`)).data ;
  }

  public async queryMore<T>(resp: QueryResponse<T>): Promise<QueryResponse<T>> {
    // @ts-ignore
    return (await this.request.get(resp.nextRecordsUrl)).data;
  }

  /**
   *  Run a SOSL query
   *
   * @template T
   * @param {string} query
   * @returns {Promise<SearchResponse<T>>}
   * @memberof Rest
   */
  public async search<T>(query: string): Promise<SearchResponse<T>> {
    let qryString = encodeURIComponent(query);
    return (await this.request.get(`/services/data/${this.version}/search?q=${qryString}`)).data;
  }

  /**
   *  Returns Limit information about your orgs current usage
   *   NOTE: Rest Limit usage is updated on every request and can be accessed via `apiLimit` property on this class
   * @returns {Promise<Limits>}
   * @memberof Rest
   */
  public async limits(): Promise<Limits> {
    return (await this.request.get(`/services/data/${this.version}/limits`)).data;
  }

  /**
   * Call an Invokable Action
   * @template O output item type
   * @param {string} action Name of invocable action to call.  Namespaces must be prefixed!
   * @param {any[]} inputs The list of inputs to pass in. See Salesforce Documenation
   * @returns {Promise<InvokableResult<O>>}
   * @memberof Rest
   */
  public async invokeAction<O>(action: string, inputs: any[]): Promise<InvokableResult<O>> {
    return (
      await this.request.post(
        `/services/data/${this.version}/actions/custom/apex/${action}`,
        { inputs }
      )
    ).data;
  }

}
