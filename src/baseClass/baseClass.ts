import * as pluralize from 'pluralize'
import { BaseClass } from "../types/class.types";
import { RecordSchema } from '../types/schema.types';
import makeBaseClassConstructor from './constructor/makeBaseClassConstructor';
import addBaseClassStatics from './statics/addBaseClassStatics';
import addBaseClassInstances from './instances/addBaseClassInstances';

/**
 * Create a `BaseClass<Schema>`, where `Schema` is an Active `RecordSchema`.
 * 
 * @param className - The name used as a basis for the Firebase RTD table
 * @param schema - The `RecordSchema` for an `ActiveRecord` of the resultant class
 * 
 * @returns The `BaseClass<S>`.
 * @template Schema - A `RecordSchema`
 */
function baseClass<Schema extends RecordSchema>(className: string, schema: Schema) {
  // our JavaScript `Record` variable, with a constructor type
  let BaseClass: BaseClass<Schema>;

  const tableName = pluralize.plural(className)

  // Constructor function does not satisfy the whole `BaseClass` type
  //  so it needs to be case to any
  BaseClass = <any>makeBaseClassConstructor(className, schema);

  // adding static properties/methods onto `BaseClass`
  // @ts-ignore : infinitely deep :(
  addBaseClassStatics(BaseClass, { tableName })

  // adding instance methods and properties onto `BaseClass.prototype`
  addBaseClassInstances(BaseClass, { schema, tableName })

  return BaseClass
}

export default baseClass