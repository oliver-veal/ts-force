import type { IAxiodResponse } from 'https://deno.land/x/axiod@0.20.0-0/interfaces.ts';
import { ApiLimit } from './restTypes.ts';

const LIMITS_REGEX = /api-usage=(\d+)\/(\d+)/;

export const parseLimitsFromResponse = (response: IAxiodResponse): ApiLimit | null => {
    // @ts-ignore
  if (response.headers && response.headers['sforce-limit-info']) {
    // @ts-ignore
    const match = LIMITS_REGEX.exec(response.headers['sforce-limit-info']);
    if (!match) {
      return null;
    }
    const [, used, total] = match;
    return {
      used: Number(used),
      limit: Number(total)
    };
  }
  return null;
};
