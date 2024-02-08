import { mock } from 'node:test';
import { start_recording } from '../engine';
import { AudioContext } from 'standardized-audio-context-mock';
// jest.mock('standardized-audio-context', () => StandardizedAudioContextMock);
let mockedAudioContext;
const mockAudioContext = jest.fn(
  () => (mockedAudioContext = new AudioContext()),
);
global.AudioContext = mockAudioContext;

afterEach(() => {
  jest.resetAllMocks();
});
describe('😁 Happy path', () => {
  test('init', () => {
    const start = start_recording();
    // console.log(mockedAudioContext);
    expect(true).toBe(true);
  });
});

describe('😢 Sad path', () => {
  test('failure', () => {
    expect(false).toBe(false);
  });
});

describe('🧘 The middle way', () => {
  test('ommmmmm', () => {
    expect(true).toBe(true);
  });
});
