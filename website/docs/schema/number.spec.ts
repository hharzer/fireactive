import { ActiveClass, Schema } from '../../../src'
import testExpectError from '../../../src/utils/testExpectError';
import ActiveClassError from '../../../src/ActiveClass/Error';

describe('Basic example', () => {
  const buildingSchema = {
    floors: Schema.number
  }

  class Lightbulb extends ActiveClass(buildingSchema) { }

  describe('Creation', () => {
    describe('Runtime errors', () => {
      testExpectError(
        'Requires an argument',
        // @ts-ignore
        () => new Lightbulb(),
        { message: `Could not construct Lightbulb. The required property 'floors' is missing`, constructor: ActiveClassError }
      )

      testExpectError(
        'Requires the property',
        // @ts-ignore
        () => new Lightbulb({}),
        { message: `Could not construct Lightbulb. The required property 'floors' is missing`, constructor: ActiveClassError }
      )

      testExpectError(
        'Requires the property to be the right type',
        // @ts-ignore
        () => new Lightbulb({ floors: '4' }),
        { message: `Could not construct Lightbulb. The property 'floors' is of the wrong type`, constructor: ActiveClassError }
      )

      testExpectError(
        'Requires the property not to be null (strictNullChecks)',
        // @ts-ignore
        () => new Lightbulb({ floors: null }),
        { message: `Could not construct Lightbulb. The property 'floors' is of the wrong type`, constructor: ActiveClassError }
      )
    })

    test('Runtime passes', () => {
      // @ts-ignore
      expect(() => new Lightbulb({ floors: 4, randomProp: 9 })).not.toThrow()
      expect(() => new Lightbulb({ floors: 4 })).not.toThrow()
      expect(() => new Lightbulb({ floors: 9})).not.toThrow()
    })
  })

  // describe('Updates', () => {
  //   const building = new Lightbulb({ floors: true })

  //   test("Can assign boolean values", () => {
  //     building.floors = false
  //     expect(building.floors).toBe(false)
  //   })

  //   testExpectError("Can't assign non-boolean values", () => {
  //     // @ts-ignore
  //     building.floors = 'true'
  //   }, { message: `Lightbulb could not accept the value "true" (string) at path 'floors'. The property 'floors' is of the wrong type`, constructor: ActiveClassError })
  // })
})

// describe('Configuration', () => {
//   const buildingSchema = {
//     floors: Schema.number,
//     isEco: Schema.number({ default: false }),
//     isLED: Schema.number({ optional: true }), // or required: false,
//     isSmart: Schema.number({ optional: true, default: false })
//   }

//   class Lightbulb extends ActiveClass(buildingSchema) {}

//   const building = new Lightbulb({ floors: false })
  
//   test('Initial values', () => {
//     expect(building.floors).toBe(false)
//     expect(building.isEco).toBe(false)
//     expect(building.isLED).toBeUndefined()
//     expect(building.isSmart).toBe(false)
//   })

//   describe('Required with no default', () => {
//     testExpectError('throws error when assigned undefined', () => {
//       // @ts-ignore
//       building.floors = undefined
//     }, { message: `Lightbulb could not accept the value undefined (undefined) at path 'floors'. The required property 'floors' is missing`, constructor: ActiveClassError })

//     testExpectError('throws error when assigned null', () => {
//       // @ts-ignore
//       building.floors = null
//     }, { message: `Lightbulb could not accept the value null (object) at path 'floors'. The property 'floors' is of the wrong type`, constructor: ActiveClassError })
//   })

//   describe('Required with default', () => {    
//     it('defaults when assigned undefined', () => {
//       // @ts-ignore
//       building.isEco = undefined
//       expect(building.isEco).toBe(false)
//     })

//     testExpectError('throws error when assigned null', () => {
//       // @ts-ignore
//       building.isEco = null
//     }, { message: `Lightbulb could not accept the value null (object) at path 'isEco'. The property 'isEco' is of the wrong type`, constructor: ActiveClassError })
//   })

//   describe('Optional with no default', () => {
//     it('does not default or throw error when assigned undefined', () => {
//       // @ts-ignore
//       building.isLED = undefined
//       expect(building.isLED).toBeUndefined()
//     })

//     it('does not default or throw error when assigned null', () => {
//       // @ts-ignore
//       building.isLED = null
//       expect(building.isLED).toBeNull()
//     })
//   })

//   describe('Optional with default', () => {
//     it('defaults when assigned undefined', () => {
//       // @ts-ignore
//       building.isSmart = undefined
//       expect(building.isSmart).toBe(false)
//     })

//     it('does not default or throw error when assigned null', () => {
//       // @ts-ignore
//       building.isSmart = null
//       expect(building.isSmart).toBeNull()
//     })
//   })
// })