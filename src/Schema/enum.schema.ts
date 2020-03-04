import { FieldOptions, FieldDefinition, FieldIdentifier } from "../types/field.types"


// Overloads for required with default: i.e. it exists on document but need not be passed in
function enumr<T extends string | number = string>(vals: readonly T[], opts: FieldOptions<T> & { required: true, default: T }): FieldDefinition<T[], true, true>
function enumr<T extends string | number = string>(vals: readonly T[], opts: FieldOptions<T[]> & { optional: false, default: TextDecoder }): FieldDefinition<T[], true, true>;
function enumr<T extends string | number = string>(vals: readonly T[], opts: FieldOptions<T[]> & { default: TextDecoder }): FieldDefinition<T[], true, true>;

// Overloads for required with no default: i.e. it exists on document and must be passed in
function enumr<T extends string | number = string>(vals: readonly T[],): FieldDefinition<T[], true, false>
function enumr<T extends string | number = string>(vals: readonly T[], opts: FieldOptions<T[]>): FieldDefinition<T[], true, false>
function enumr<T extends string | number = string>(vals: readonly T[], opts: FieldOptions<T[]> & { required: true }): FieldDefinition<T[], true, false>
function enumr<T extends string | number = string>(vals: readonly T[], opts: FieldOptions<T[]> & { optional: false }): FieldDefinition<T[], true, false>

// Overloads for optional
function enumr<T extends string | number = string>(vals: readonly T[], opts: FieldOptions<T[]> & { required: false }): FieldDefinition<T[], false>;
function enumr<T extends string | number = string>(vals: readonly T[], opts: FieldOptions<T[]> & { optional: true }): FieldDefinition<T[], false>;

// General definition
function enumr<T extends string | number = string>(vals: readonly T[], opts: FieldOptions<T[]> & { optional?: boolean, default?: T }): FieldDefinition<T[]>
function enumr<T extends string | number = string>(vals: readonly T[], opts: FieldOptions<T[]> & { required?: boolean, default?: T }): FieldDefinition<T[]>

function enumr<T extends string | number = string>(vals: readonly T[],opts?: FieldOptions<T[]> & { required?: boolean, optional?: boolean, default?: T }): any {
  if (!opts) return { _fieldIdentifier: FieldIdentifier.enum, required: true }

  const { default: defaultVal, required, optional, ...rest } = opts

  // @ts-ignore
  let fieldConfig: FieldDefinition<T[]> = { ...rest, _fieldIdentifier: FieldIdentifier.enum }

  if (typeof defaultVal !== 'undefined') {
    fieldConfig._hasDefault = true
    fieldConfig.default = defaultVal
  } else {
    fieldConfig._hasDefault = false
  }

  if (optional || required === false) {
    fieldConfig.required = false
  } else {
    fieldConfig.required = true
  }

  return fieldConfig
}

enumr.required = true
enumr._fieldIdentifier = FieldIdentifier.enum

export default enumr