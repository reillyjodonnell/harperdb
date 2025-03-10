import { describe, it, expect } from 'vitest';
import { getNext5DayForecast, mostFrequent } from './utils.js';
import testData from './test.json';

describe('showing 5 day summary', () => {
  it('should give a high, low, and averaged status', () => {
    const result = getNext5DayForecast(testData);
    expect(result.length).toBe(5);
  });
});

describe('mostFrequent', () => {
  it('Should return the most frequent string in an array', () => {
    const arr = ['a', 'b', 'a', 'c', 'a', 'd', 'a'];
    expect(mostFrequent(arr)).toBe('a');
  });
});
