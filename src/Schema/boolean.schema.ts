import { FieldOptions, FieldDefinition, FieldIdentifier } from "../types/field.types"

// Overloads for required with default: i.e. it exists on document but need not be passed in
function booleanFn(opts: FieldOptions<boolean> & { required: true, default: boolean }): FieldDefinition<boolean, true, true>;
function booleanFn(opts: FieldOptions<boolean> & { optional: false, default: boolean }): FieldDefinition<boolean, true, true>;
function booleanFn(opts: FieldOptions<boolean> & { default: boolean }): FieldDefinition<boolean, true, true>;

// Overloads for required with no default: i.e. it exists on document and must be passed in
function booleanFn(): FieldDefinition<boolean, true, false>
function booleanFn(opts: FieldOptions<boolean>): FieldDefinition<boolean, true, false>
function booleanFn(opts: FieldOptions<boolean> & { required: true }): FieldDefinition<boolean, true, false>
function booleanFn(opts: FieldOptions<boolean> & { optional: false }): FieldDefinition<boolean, true, false>

// Overloads for optional wiwth default
function booleanFn(opts: FieldOptions<boolean> & { optional: true, default: boolean }): FieldDefinition<boolean, false, true>;
function booleanFn(opts: FieldOptions<boolean> & { required: false, default: boolean }): FieldDefinition<boolean, false, true>;

// Overloads for optional
function booleanFn(opts: FieldOptions<boolean> & { required: false }): FieldDefinition<boolean, false>;
function booleanFn(opts: FieldOptions<boolean> & { optional: true }): FieldDefinition<boolean, false>;

// General definition
function booleanFn(opts: FieldOptions<boolean> & { optional?: boolean, default?: boolean }): FieldDefinition<boolean>
function booleanFn(opts: FieldOptions<boolean> & { required?: boolean, default?: boolean }): FieldDefinition<boolean>

function booleanFn(opts?: FieldOptions<boolean> & { required?: boolean, optional?: boolean, default?: boolean }): any {
  if (!opts) return { _fieldIdentifier: FieldIdentifier.boolean, required: true }

  const { default: defaultVal, required, optional, ...rest } = opts

  // @ts-ignore
  let fieldConfig: FieldDefinition<boolean> = { ...rest, _fieldIdentifier: FieldIdentifier.boolean }

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

const boolean = Object.assign(booleanFn, booleanFn())

export default boolean