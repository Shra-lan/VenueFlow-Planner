import { readFileSync } from 'fs';
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { describe, beforeAll, afterAll, beforeEach, it } from 'vitest';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    firestore: {
      rules: readFileSync('DRAFT_firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Firestore Security Rules', () => {
  it('allows verified user to create their own alert', async () => {
    const db = testEnv.authenticatedContext('user123', { email_verified: true, email: 'user@example.com' }).firestore();
    await assertSucceeds(db.collection('alerts').doc('alert1').set({
      id: 'alert1',
      type: 'Medical',
      status: 'Active',
      userId: 'user123',
      createdAt: testEnv.firestore.FieldValue.serverTimestamp()
    }));
  });

  it('rejects identity spoofing on create', async () => {
    const db = testEnv.authenticatedContext('user123', { email_verified: true, email: 'user@example.com' }).firestore();
    await assertFails(db.collection('alerts').doc('alert1').set({
      id: 'alert1',
      type: 'Medical',
      status: 'Active',
      userId: 'hacker', // Spoofed
      createdAt: testEnv.firestore.FieldValue.serverTimestamp()
    }));
  });

  it('rejects if email not verified', async () => {
    const db = testEnv.authenticatedContext('user123', { email_verified: false, email: 'user@example.com' }).firestore();
    await assertFails(db.collection('alerts').doc('alert1').set({
      id: 'alert1',
      type: 'Medical',
      status: 'Active',
      userId: 'user123',
      createdAt: testEnv.firestore.FieldValue.serverTimestamp()
    }));
  });

  it('allows admin to list all alerts', async () => {
    // Setup data as admin to bypass rule for setting up
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await ctx.firestore().collection('alerts').doc('alert1').set({
            userId: 'someone'
        });
    });

    const db = testEnv.authenticatedContext('admin1', { email_verified: true, email: 'trshraddha6@gmail.com' }).firestore();
    await assertSucceeds(db.collection('alerts').get());
  });

  it('rejects regular user from listing all alerts without where clause', async () => {
    const db = testEnv.authenticatedContext('user123', { email_verified: true, email: 'user@example.com' }).firestore();
    await assertFails(db.collection('alerts').get());
  });

  it('allows regular user to list their own alerts', async () => {
    const db = testEnv.authenticatedContext('user123', { email_verified: true, email: 'user@example.com' }).firestore();
    await assertSucceeds(db.collection('alerts').where('userId', '==', 'user123').get());
  });
});
