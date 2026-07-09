import { describe, it, expect } from 'vitest';
import { User } from '../models/User';

describe('User Model Password Hashing', () => {
  it('should hash the password when saving a user', async () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'hash-test@example.com',
      password: 'plainPassword123!',
      userType: 'TENANT',
      phone: '+233 240000000',
    });

    // Verify password is plain initially
    expect(user.password).toBe('plainPassword123!');

    // Mock isModified to return true for manual test context
    user.isModified = () => true;

    // Get the pre-save hook function from Mongoose schema hooks
    const saveHooks = (user.schema as any).s.hooks._pres.get('save');
    const hashPasswordHook = saveHooks.find((hook: any) => hook.fn.name === 'hashPassword');

    if (!hashPasswordHook) {
      throw new Error(
        `hashPassword pre-save hook not found. Available hooks: ${saveHooks.map((h: any) => h.fn.name).join(', ')}`
      );
    }

    const preSaveHook = hashPasswordHook.fn;

    // Call hook manually with user context
    await new Promise<void>((resolve, reject) => {
      preSaveHook.call(user, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Verify password is now hashed
    expect(user.password).not.toBe('plainPassword123!');
    expect(user.password.startsWith('$2a$') || user.password.startsWith('$2b$')).toBe(true);
  });
});
