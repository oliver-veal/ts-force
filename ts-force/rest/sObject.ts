import { DEFAULT_CONFIG } from '../auth/baseConfig.ts';
import { SalesforceFieldType, sField } from './sObjectDecorators.ts';

export class SObjectAttributes {
    // @ts-ignore
  public type: string; // sf apex name
    // @ts-ignore
  public url: string; // sf rest API url for record
}

/* Base SObject */
export abstract class SObject {

    // @ts-ignore
  @sField({ apiName: 'Id', createable: false, updateable: false, required: false, externalId: false, reference: null, childRelationship: false, salesforceType: SalesforceFieldType.ID })
  public id?: string | null;
  public attributes: SObjectAttributes;
  public __UUID?: symbol;

  constructor(type: string) {
    this.attributes = new SObjectAttributes();
    this.attributes.type = type;
    if (DEFAULT_CONFIG.version) {
      this.attributes.url = `/services/data/v${DEFAULT_CONFIG.version.toFixed(1)}/sobjects/${this.attributes.type}`;
    }
  }
}
