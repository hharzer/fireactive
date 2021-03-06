import { ActiveClass, Schema } from '../../../src/'
import ActiveClassError from '../../../src/ActiveClass/Error/ActiveClassError'

const userSchema = {
  name: Schema.string,  // users must have a name
  age: Schema.number({ optional: true }), // age is optional
  role: Schema.enum(['admin', 'basic']), // role must be 'admin' or 'basic'
  isVerified: Schema.boolean({ default: false }) // defaults to false
}

class User extends ActiveClass(userSchema) {
  // optionally, add your own methods, e.g.

  promote() {
    this.role = 'admin'
  }
}

let user: User

describe('ES6 Classes with ActiveClass', () => {
  test('Instantiating your ActiveClass', () => {
    user = new User({ name: 'Richard', role: 'admin' })
    expect(user.name).toBe('Richard')
    expect(user.age).toBeUndefined()
    expect(user.role).toBe('admin')
    expect(user.isVerified).toBe(false)
  })

  test('No _id and not syncing', () => {
    expect(user._id).toBeUndefined()
    expect(user.syncOpts()).toEqual({ fromDb: false, toDb: false })
  })

  test('Trying to save to the database will fail', async (done) => {
    expect.assertions(2)
    try {
      await user.save()
    } catch (err) {
      expect(err).toBeInstanceOf(ActiveClassError)
      expect(err.message).toMatch("Failed to save User into database. Could not connect to your Firebase database. This might be because you have not initialized your Firebase app. Try calling Fireactive.initialize")
      done()
    }
  })
})