import { UndefinedToOptional } from "./util.types"

export interface FieldOptions<T> {
  // default?: T,
}

export interface IndexedFieldDefinition<T = any, R extends boolean = boolean, D extends boolean = boolean> {
  _fieldIdentifier: FieldIdentifier.indexed,
  indexed: FieldDefinition<T, R, D>
}

/**
 * @template R - is field required on the record?
 * @template D - does the field initialise with a default value?
 */
export type FieldDefinition<T = any, R extends boolean = boolean, D extends boolean = boolean> =
  // handle indexed case first
  T extends { [key: string]: infer U } ? { _fieldIdentifier: FieldIdentifier.indexed, indexed: U, required: R }
    // if not indexed, then it's number, boolean, enum or string
    : FieldOptions<T> & {
      _fieldIdentifier: T extends number ? FieldIdentifier.number
      : T extends boolean ? FieldIdentifier.boolean
      // we pass an array for an enum
      : T extends Array<infer E> ? FieldIdentifier.enum
      : T extends string ? FieldIdentifier.string
      : unknown
    } & {
      required: R,
      default?: T extends Array<infer E> ? E : T
    } & (D extends true ? { _hasDefault: true } : { _hasDefault: false })
      & (T extends Array<infer E> ? { vals: E[] } : {})

export type FieldType<FI, T = unknown> =
  FI extends FieldIdentifier.boolean ? boolean
    : FI extends boolean ? boolean
    : FI extends FieldIdentifier.number ? number
    : FI extends number ? number
    // if it's an enum, we intend to pass the union type as T
    : FI extends FieldIdentifier.enum ? T
    : FI extends FieldIdentifier.indexed ? { [key: string]: T }
    : FI extends FieldIdentifier.string ? string
    // check this last as all `FieldIdentifier`s extend strings
    : FI extends string ? string
    : unknown

export enum FieldIdentifier {
  string = 'STRING_FIELD_IDENTIFIER',
  number = 'NUMBER_FIELD_IDENTIFIER',
  boolean = 'BOOLEAN_FIELD_IDENTIFIER',
  enum = 'ENUM_FIELD_IDENTIFIER',
  indexed = 'INDEXED_FIELD_IDENTIFIER'
}

export type TypeFromIdentifier<T, U = unknown> =
  T extends FieldIdentifier.string ? string
  : T extends FieldIdentifier.number ? number
  : T extends FieldIdentifier.boolean ? boolean
  // if it's an enum, hopefully we pass along the enum values...
  : T extends FieldIdentifier.enum ? U
  : T extends FieldIdentifier.indexed ? { [key: string]: U }
  : unknown

/**
 * Converts a FieldDefinition to a value that the record holds
 */
export type RecordField<FD> =
  // handle indexed cases
  FD extends { _fieldIdentfier: FieldIdentifier.indexed, indexed: infer I }
    ? I extends { _fieldIdentifier: infer C, vals: infer E } ? TypeFromIdentifier<FieldIdentifier.indexed, E>
      : I extends { _fieldIdentifier: infer C } ? TypeFromIdentifier<FieldIdentifier.indexed, TypeFromIdentifier<C>>
    : unknown
    // handle enum cases: is it optional?
    : FD extends { _fieldIdentifier: infer C, vals: Array<infer E>, required: false } ? TypeFromIdentifier<C, E> | undefined
    // required enum
    : FD extends { _fieldIdentifier: infer C, vals: Array<infer E> } ? TypeFromIdentifier<C, E>
    // if FD.required === false, then the record might not have the property
    : FD extends { _fieldIdentifier: infer C, required: false } ? TypeFromIdentifier<C> | undefined
    // else if it has `_fieldIdentifier`, then it is a necessary primitive field
    : FD extends { _fieldIdentifier: infer C } ? TypeFromIdentifier<C>
    // else it is an object of RecordFields, some of which might be optional
    : FD extends {} ? UndefinedToOptional<{ [K in keyof FD]: RecordField<FD[K]> }>
    // 🤷
    : unknown

/**
 * Converts a FieldDefinition to a value taken by the record on initialisation
 */
export type CreateField<FD> =
  /* UNUSUAL CASES */
  // handle enum cases: does it have a default value?
  FD extends { _fieldIdentifier: infer C, vals: Array<infer E>, _hasDefault: true } ? TypeFromIdentifier<C, E> | undefined
    // or is it an enum that is not required?
    : FD extends { _fieldIdentifier: infer C, vals: Array<infer E>, required: false } ? TypeFromIdentifier<C, E> | undefined
    // or if it's still an enum, it's one required at creation
    : FD extends { _fieldIdentifier: infer C, vals: Array<infer E> } ? TypeFromIdentifier<C, E>
    // handle indexed cases
    : FD extends { _fieldIdentifier: FieldIdentifier.indexed, indexed: infer T }
      ? T extends { _fieldIdentifier: FieldIdentifier.enum, vals: Array<infer E> }
        ? TypeFromIdentifier<FieldIdentifier.indexed, E>
        : T extends { _fieldIdentifier: infer C } ? TypeFromIdentifier<FieldIdentifier.indexed, TypeFromIdentifier<C>>
      // 🤷
      : unknown

    /* ORDINARY CASES */
    // if FD._hasDefault === true, then field does not need to be supplied at creation
    : FD extends { _fieldIdentifier: infer C, _hasDefault: true } ? TypeFromIdentifier<C> | undefined
    // if FD.required === false, then field does not need to be supplied at creation
    : FD extends { _fieldIdentifier: infer C, required: false } ? TypeFromIdentifier<C> | undefined
    // else if it's a primitive field, then it does need to be supplied at creation
    : FD extends { _fieldIdentifier: infer C } ? TypeFromIdentifier<C>

    /* NESTED SCHEMA */
    // if not a primitive field, it's probably an object of other fields
    : FD extends {} ? UndefinedToOptional<{ [K in keyof FD]: CreateField<FD[K]> }>
    // 🤷
    : unknown