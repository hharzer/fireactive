import { RecordSchema, ObjectFromRecord, ToCreateRecord, RecordProps, FirebaseTable } from "./schema.types"
import { SyncOpts } from "./sync.types"

export type ClassConstructor<T = unknown> = { new(...args: any[]): T; };

/**
 * An `ActiveRecord<S>` _instance_ of the `ActiveClass<S>`. 
 * This interface holds the instance methods and properties.
 */
export type ActiveRecord<S extends RecordSchema = RecordSchema> = ObjectFromRecord<S> & {
  constructor: ActiveClass<S>

  /**
   * Returns the `ActiveRecord`'s `_id` property if it has one, or
   *  generates one if one does not yet exist.
   * 
   * @returns The `ActiveRecord`'s `_id`, whether existing or generated
   */
  getId(): string,

  /**
   * Reloads the instance's properties from the Firebase database
   * 
   * @returns The values reloaded from the Firebase database
   */
  reload(): Promise<ObjectFromRecord<S>>,

  /**
   * Get a `Reference` for the record and/or a child within it
   * 
   * @param path - a relative path from the record
   * @returns a `Reference` for the record, to its relative path
   *  if supplied
   */
  ref(path?: string): firebase.database.Reference,

  /**
   * Save the instance to Firebase
   * 
   * @returns The values saved to the Firebase database
   */
  save(): Promise<ObjectFromRecord<S>>,


  /**
   * Save the instance to Firebase and turns on syncing
   * 
   * @returns The values saved to the Firebase database
   */
  saveAndSync(syncOpts?: Partial<SyncOpts>): Promise<ObjectFromRecord<S>>,

  /**
   * A promise resolved when all pending setter promises to
   *  the database have been completed
   * 
   * @returns a `Promise`
   */
  pendingSetters(): Promise<any>,

  /**
   * An array of all pending setter promises to
   *  the database
   * 
   * @returns the array of all pending setter promises
   *  to the database
   */
  pendingSetters({ array }: { array: true }): Promise<any>[],

  /**
   * Returns the current syncing options for the `ActiveRecord`
   */
  syncOpts(): SyncOpts

  /**
   * Update sync options and return the overall syncing options
   *  for the `ActiveRecord`
   * @param syncOpts - The sync options to update
   * @returns the current syncing options after the update
   */
  syncOpts(syncOpts: Partial<SyncOpts>): SyncOpts


  /**
   * Return the raw object properties (as schematised)
   * @returns an object with type properties `ObjectFromRecord<S>`
   */
  toObject(): ObjectFromRecord<S>
}




/**
 * A _class_ to create `ActiveRecord<S>` instances from the `RecordSchema`, `S`. 
 * This interface holds the static class methods and properties.
 * 
 * @template S - a RecordSchema
 */
export type ActiveClass<S extends RecordSchema = RecordSchema> = {
  /**
   * Create an instance of the ActiveRecord -
   *  not yet saved to the database
   */
  new(props: ToCreateRecord<S> & { _id?: string }): ActiveRecord<S>,

  prototype: ActiveRecord<S>,

  /**
   * The 'table' key which this model uses in the Firebase RTD.
   */
  key: string,

  /**
   * Caches the current table value
   * 
   * @param {boolean} [listenForUpdates = true] whether the cache should
   *  listen and automatically update to table changes
   * 
   * @returns the cached object table for the class
   */
  cache(listenForUpdates?: boolean): Promise<FirebaseTable<S>>,

  /**
   * The currently cached object table for the class
   */
  cached: FirebaseTable<S>,

  /**
   * Create a new model and save it to the database
   * 
   * @param props Properties to create the Record with
   * @returns a `Promise` that resolves into the created record
   */
  create<ThisClass extends ActiveClass<S> = ActiveClass<S>>(this: ThisClass, props: ToCreateRecord<S> & { _id?: string }): Promise<InstanceType<ThisClass>>,

  /**
   * Delete all `ActiveRecord`s from the database that
   *  match the passed in `props`
   * 
   * @param props Properties to create the Record with
   * @returns a `Promise` that resolves with the count of deleted records
   */
  delete(props: Partial<ObjectFromRecord<S>>): Promise<number>,

  /**
   * Delete the first `ActiveRecord` from the database that
   *  matches the passed in `props`
   * 
   * @param props Properties to create the Record with
   * @returns a `Promise` that resolves to whether or not a record was deleted
   */
  deleteOne(props: Partial<ObjectFromRecord<S>>): Promise<boolean>,

  /**
   * Find all `ActiveRecord`s from the database that
   *  match the passed in `props`
   * 
   * @param props 
   * @returns an array of `ActiveRecord<S>`
   */
  find<ThisClass extends ActiveClass<S> = ActiveClass<S>>(this: ThisClass, props: Partial<ObjectFromRecord<S>>): Promise<InstanceType<ThisClass>[]>,

  /**
   * Find a single ActiveRecord in the database by id
   * 
   * @param id - id of the ActiveRecord to find
   * @returns the `ActiveRecord` found, or `null` if none
   */
  findById<ThisClass extends ActiveClass<S> = ActiveClass<S>>(this: ThisClass, id: string): Promise<InstanceType<ThisClass> | null>,

  /**
   * Find a single ActiveRecord in the database by
   *  retrieving the first that matches the passed in `props`
   * 
   * @param props 
   * @returns the `ActiveRecord` found, or `null` if no record was found
   */
  findOne<ThisClass extends ActiveClass<S> = ActiveClass<S>>(this: ThisClass, props: Partial<ObjectFromRecord<S>>): Promise<InstanceType<ThisClass> | null>,

  /**
   * Create an `ActiveRecord` from some props, such that it
   *  is syncing to and from the database.
   * 
   * This is equivalent to using the `new` constructor
   *  (except an `_id` **must** be provided) and immediately
   *  turning on syncing to and from the database (hence
   *  why `_id` is necessary).
   * 
   * @param props 
   * @returns the `ActiveRecord`
   */
  from<ThisClass extends ActiveClass<S> = ActiveClass<S>>(this: ThisClass, props: ObjectFromRecord<S> & { _id: string }): InstanceType<ThisClass>,

  /**
   * Return the Firebase Real-Time Database instance and interface
   * @returns `firebase.database.Database`
   */
  getDb(): firebase.database.Database,

  /**
   * Get a `Reference` for the table and/or a child within it
   * 
   * @param path - a relative path from the table
   * @returns a `Reference` for the table, to its relative path
   *  if supplied
   */
  ref(path?: string): firebase.database.Reference,

  /**
   * Updates all `ActiveRecord`s from the database that
   *  match the passed in `props` with `updateProps`
   * 
   * @param props - props to match by
   * @param updateProps - props to update
   * @returns an array of `ActiveRecord<S>` that were updated
   */
  update<ThisClass extends ActiveClass<S> = ActiveClass<S>>(this: ThisClass, props: Partial<ObjectFromRecord<S>>, updateProps: Partial<RecordProps<S>>): Promise<InstanceType<ThisClass>[]>

  /**
   * Update a single ActiveRecord in the database by
   *  retrieving the first that matches the passed in `props`
   *  and updating it using `updateProps`
   * 
   * @param props 
   * @returns the updated `ActiveRecord` if there is one, or `null` otherwise
   */
  updateOne<ThisClass extends ActiveClass<S> = ActiveClass<S>>(this: ThisClass, props: Partial<ObjectFromRecord<S>>, updateProps: Partial<RecordProps<S>>): Promise<InstanceType<ThisClass> | null>,


  value(props: Partial<ObjectFromRecord<S>>): Promise<ObjectFromRecord<S> | null>
  values(props?: Partial<ObjectFromRecord<S>>): Promise<ObjectFromRecord<S>[]>,
}