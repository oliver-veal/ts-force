import type { SourceFile } from 'https://deno.land/x/ts_morph@12.2.0/mod.ts';
import { SObjectGenerator, TS_FORCE_IMPORTS } from './sObjectGenerator.ts';
import * as path from 'https://deno.land/std@0.113.0/path/mod.ts';
import { SObjectConfig, Config } from './config.ts';
import { cleanAPIName, replaceSource } from './util.ts';
import { setDefaultConfig } from '../ts-force/index.ts'

export const generate = async (config: Config) => {
  let save = true;

  if (config.outPath == null) {
    config.outPath = './placeholder.ts';
    save = false;
  }

  let singleFileMode = false;

  if (config.outPath.endsWith('.ts'))
    singleFileMode = true;

  if (config.keepNamespaces === undefined)
    config.keepNamespaces = false;

  let sobConfigs = config.sObjects!.map(item => {
    let objConfig: SObjectConfig;
    if (typeof item === 'string') {
      objConfig = {
        apiName: item,
        className: undefined,
        autoConvertNames: true
      };
    } else {
      objConfig = item;
    }

    if (config.generatePicklists && objConfig.generatePicklists === undefined) {
      objConfig.generatePicklists = true;
    }

    if (config.keepNamespaces && objConfig.keepNamespaces === undefined) {
      objConfig.keepNamespaces = true;
    }

    if (config.enforcePicklistValues && objConfig.enforcePicklistValues === undefined) {
      objConfig.enforcePicklistValues = config.enforcePicklistValues;
    }

    objConfig.autoConvertNames = objConfig.autoConvertNames || true;
    objConfig.className = objConfig.className || sanitizeClassName(objConfig);

    return objConfig;
  });

  let index: SourceFile;

  if (singleFileMode) {
    index = replaceSource(config.outPath);
    index.addImportDeclaration(TS_FORCE_IMPORTS);
  } else {
    // create index so we can easily import
    let indexPath = path.join(config.outPath, 'index.ts');
    index = replaceSource(indexPath);
  }

  setDefaultConfig(config.auth!)

  for (let sobConfig of sobConfigs) {
    let classSource: string | SourceFile;

    if (singleFileMode) {
      classSource = index;
    } else {
      index.addExportDeclaration({
        moduleSpecifier: `./${sobConfig.className}.ts`
      });
      classSource = path.join(config.outPath, `${sobConfig.className}.ts`);
    }

    let gen = new SObjectGenerator(
      classSource,
      sobConfig,
      sobConfigs
    );

    try {
      let source = await gen.generateFile();

      if (!singleFileMode) {
        source.formatText();
        if (save) {
          await source.save();
        } else {
          console.log(source.getText());
        }
      }
    } catch (error) {
      console.log(error);
      Deno.exit(1);
    }
  }

  index.formatText();

  if (save)
    await index.save();
  else
    console.log(index.getText());
}

const sanitizeClassName = (sobConfig: SObjectConfig): string => {
  if (sobConfig.autoConvertNames)
    return cleanAPIName(sobConfig.apiName, sobConfig.keepNamespaces!);

  return sobConfig.apiName;
}