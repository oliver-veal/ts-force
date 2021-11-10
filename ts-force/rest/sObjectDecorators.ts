// import { Reflect } from "https://deno.land/x/reflect_metadata@v0.1.12/Reflect.ts";
// import { Reflect } from "../../../deno-reflect-metadata/Reflect.ts";
import "https://esm.sh/reflect-metadata@0.1.13"
import { RestObject } from "./restObject.ts";

export enum SalesforceFieldType {
  DATE = "date",
  DATETIME = "datetime",
  BOOLEAN = "boolean",
  DOUBLE = "double",
  INTEGER = "integer",
  CURRENCY = "currency",
  REFERENCE = "reference",
  STRING = "string",
  PICKLIST = "picklist",
  TEXTAREA = "textarea",
  ADDRESS = "address",
  PHONE = "phone",
  URL = "url",
  MULTIPICKLIST = "multipicklist",
  PERCENT = "percent",
  EMAIL = "email",
  INT = "int",
  LOCATION = "location",
  ID = "id",
  BASE64 = "base64",
  ANYTYPE = "anytype",
  TIME = "time",
  ENCRYPTEDSTRING = "encryptedstring",
  COMBOBOX = "combobox",
}
const sFieldMetadataKey = Symbol("sField");

export class SFieldProperties {
  // @ts-ignore
  public apiName: string;
  // @ts-ignore
  public updateable: boolean;
  // @ts-ignore
  public createable: boolean;
  public reference?: () => { new (): RestObject };
  // @ts-ignore
  public required: boolean;
  // @ts-ignore
  public externalId: boolean;
  // @ts-ignore
  public childRelationship: boolean;
  // @ts-ignore
  public salesforceType: SalesforceFieldType;
  public salesforceLabel?: string;

  // override to string to make it easy to use with query building
  public toString = (): string => {
    return this.apiName;
  };
}

export function sField(props: SFieldProperties) {
  return Reflect.metadata(sFieldMetadataKey, props);
}

export function getSFieldProps(
  target: any,
  propertyKey: string,
): SFieldProperties {
  let prop = Reflect.getMetadata(sFieldMetadataKey, target, propertyKey);
  if (prop) {
    prop = Object.assign(new SFieldProperties(), prop);
  }
  return prop;
}
