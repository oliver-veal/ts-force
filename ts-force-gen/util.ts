import { Project, SourceFile } from 'https://deno.land/x/ts_morph@12.2.0/mod.ts';

const API_NAME_REGEX = /(?:^((?:\w(?!__))+\w)__|^)((?:\w(?!__))+\w)(?:__(.+)$|$)/;

export const cleanAPIName = (sfName: string, keepNamespaces: boolean) => {
  let match = API_NAME_REGEX.exec(sfName);
  if (!match) {
    throw new Error('NO MATCH FOUND FOR ' + sfName);
  }
  let name = (keepNamespaces && match[1] ? match[1] : '') + match[2];
  const parts = name.split('_');
  return parts.map((p, i) => {
    if(i > 0 && p.length) {
      return p.charAt(0).toUpperCase() + p.slice(1);
    }
    return p;
  }).join('');
};

export const replaceSource = (path: string): SourceFile => {
  try {
    Deno.removeSync(path);
  } catch (e) { }
  let ast = new Project();
  return ast.createSourceFile(path);
};