jest.mock('firebase/database', () => require('../__mocks__/firebase'));

import { mockDB } from '../__mocks__/firebase';
import * as QuizAPI from '../src/lib/QuizClientAPI';

test('submitAnswer should save answer to mock DB', async () => {
  await QuizAPI.submitAnswer('alice', 1, 0);
  expect(mockDB['submissions/alice/1']).toBe(0);
});
