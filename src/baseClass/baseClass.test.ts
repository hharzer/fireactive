import FirebaseServer from 'firebase-server'
import baseClass from '.';
import Schema from '../Schema';
import initialize from '../initialize';

describe('baseClass: creating a BaseClass', () => {
  const className = 'Car'
  const schema = {
    brand: Schema.string,
    topSpeed: Schema.number
  }
  const BaseCar = baseClass(className, schema)

  it('created class knows its name', () => {
    expect(BaseCar.name).toBe(className)
  })

  it('created class knows its database key', () => {
    expect(BaseCar.key).toBe(`${className}s`)
  })
})

describe('baseClass: integration test', () => {
  describe('integration with Schema', () => {
    describe('simple non-nested schema', () => {
      const className = 'Player'
      const schema = {
        name: Schema.string,
        age: Schema.number({ required: false }),
        isCool: Schema.boolean({ default: false }),
        friends: Schema.number({ required: false }),
        children: Schema.number({ default: 4 }),
        parents: Schema.number({ optional: true })
      }

      const Player = baseClass(className, schema)
      let player: InstanceType<typeof Player>

      describe('happy path', () => {
        it("allows new instances that follow the explicit and implied requirement and defaults", () => {
          player = new Player({ name: 'Pedro', age: 3, isCool: true })
        })

        it("uses the supplied values at creation", () => {
          expect(player.name).toBe('Pedro')
          expect(player.age).toBe(3)
          expect(player.isCool).toBe(true)
        })

        it("uses a default value only if it is not overwritten", () => {
          expect(player.isCool).toBe(true)
          expect(player.children).toBe(4)
        })

        it("has optional properties as defined only if not supplied", () => {
          expect(player.age).not.toBeUndefined()
          expect(player.friends).toBeUndefined()
          expect(player.parents).toBeUndefined()
        })
      })

      describe('sad path', () => {
        it('throws an error when an implicitly required field is not supplied', () => {
          // @ts-ignore : checking static type error leads to creation error
          expect(() => new Player({ age: 4, isCool: true })).toThrow(/required/)
        })

        it('throws an error when fields supplied are of wrong type', () => {
          // @ts-ignore : checking static type error leads to creation error
          expect(() => new Player({ name: 4, age: 4, isCool: true })).toThrow(/type/)
        })
      })
    })

    describe('enum', () => {
      const className = 'User'
      const schema = {
        username: Schema.string,
        role: Schema.enum(['admin', 'regular'])
      }

      const User = baseClass(className, schema)

      describe('happy path', () => {
        it('allows instantiation with a value from the array', () => {
          const user = new User({ username: 'Test', role: 'regular' })
          expect(user.role).toBe('regular')
        })

        it('can take a default', () => {
          const schema = {
            flavour: Schema.enum(['salty', 'sweet'], { default: 'salty' })
          }
          const Popcorn = baseClass('Popcorn', schema)

          const popcorn = new Popcorn({})
          expect(popcorn.flavour).toBe('salty')
        })

        it('can be optional', () => {
          const schema = {
            name: Schema.enum(['river', 'ocean'], { optional: true })
          }
          const River = baseClass('River', schema)

          const river = new River({})
          expect(river.name).toBeUndefined()
        })

        it('can take both strings and numbers', () => {
          const schema = {
            value: Schema.enum([1, 2, 'many'])
          }

          const Number = baseClass('Number', schema)
          const number = new Number({ value: 2 })
          expect(number.value).toBe(2)
        })
      })

      describe('sad path', () => {
        it('throws an error when a non-enumerator value is provided', () => {
          expect(() => {
            // @ts-ignore : checking static error -> runtime error
            new User({ username: 'hello', role: 'banana' })
          }).toThrow(/type/)
        })

        it('throws an error when a default value is not in the enum', () => {
          expect(() => {
            const Popcorn = baseClass('Popcorn', {
              flavour: Schema.enum(['salty', 'sweet'], { default: 'salt' })
            })
          }).toThrow()
        })
      })
    })

    describe('nested schema', () => {
      const className = 'Venue'
      const schema = {
        name: Schema.string,
        hours: {
          openingTime: Schema.number,
          closingTime: Schema.number({ default: 20 })
        },
        status: {
          isAccessible: Schema.boolean({ optional: true })
        }
      }

      const Venue = baseClass(className, schema)

      describe('happy path', () => {
        it("allows new instances that follow the explicit and implied requirement and defaults", () => {
          const venue = new Venue({ name: 'WeWork', hours: { openingTime: 4 }, status: {} })
          expect(venue.name).toBe('WeWork')
          expect(venue.hours.openingTime).toBe(4)
          expect(venue.hours.closingTime).toBe(20)
          expect(venue.status.isAccessible).toBeUndefined()
        })
      })

      describe('sad path', () => {
        it('throws an error when a required nested property is not supplied', () => {
          expect(() => {
            // @ts-ignore : checking that static error -> thrown error
            new Venue({ name: 'TechHub', hours: { closingTime: 20 } })
          }).toThrow(/required/)
        })

        it('throws an error when a nested property does not fit the schema type', () => {
          expect(() => {
            // @ts-ignore : checking that static error -> thrown error
            new Venue({ name: 'TechHub', hours: { openingTime: true } })
          }).toThrow(/type/)
        })
      })
    })
  })

  describe('integration with Schema and server', () => {
    describe("GIVEN a model name of 'players' and a schema", () => {
      const className = 'player'
      const schema = {
        name: Schema.string,
        age: Schema.number,
        isCool: Schema.boolean(),
        friends: Schema.number({ required: false }),
        children: Schema.number({ default: 4 }),
        parents: Schema.number({ optional: true })
      }

      describe("WHEN the model name and schema are passed to record", () => {
        const PlayerRecord = baseClass(className, schema)

        test("THEN the result is a class that can create new instances", () => {
          const player = new PlayerRecord({ name: 'Pedro', age: 3, isCool: true })
          expect(player.name).toBe('Pedro')
          expect(player.age).toBe(3)
          expect(player.isCool).toBe(true)
          expect(player.friends).toBeUndefined()
          expect(player.children).toBe(4)
          expect(player.parents).toBeUndefined()
        })

        test("AND an error is thrown if required fields are not passed", () => {
          // @ts-ignore : checking for an error
          expect(() => new PlayerRecord({ age: 3 })).toThrow(/missing the required property/)
        })

        test("AND an error is thrown if a field is passed of the wrong type", () => {
          // @ts-ignore : checking for an error
          expect(() => new PlayerRecord({ name: 4, age: 3, isCool: true })).toThrow(/wrong type/)
        })

        test("AND using the model's create method throws an error without a database connection", () => {
          expect(PlayerRecord.create({ name: 'Pedro', age: 3, isCool: true })).rejects.toThrow('Cannot get Firebase Real-Time Database instance: have you intialised the Firebase connection?')
        })

        describe("AND a connection to a database is initialised", () => {
          let server: FirebaseServer

          beforeAll(async (done) => {
            server = new FirebaseServer(5555, 'localhost')
            initialize({
              databaseURL: `ws://localhost:${server.getPort()}`
            })
            done()
          })

          afterAll(async (done) => {
            await server.close()
            done()
          })

          test("THEN a model's create method does not throw an error", () => {
            expect(PlayerRecord.create({ name: 'Pedro', age: 3, isCool: true })).resolves.toMatchObject({
              name: 'Pedro',
              age: 3,
              isCool: true
            })
          })
        })
      })
    })
  })
})