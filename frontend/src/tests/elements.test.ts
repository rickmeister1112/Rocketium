import { describe, expect, it } from 'vitest';

import { cloneElements, createRectElement, normalizeZIndices } from '../utils/elements';

describe('elements utilities', () => {
  it('normalizes z-index values sequentially', () => {
    const first = { ...createRectElement(), zIndex: 5 };
    const second = { ...createRectElement(), zIndex: 2 };

    const normalized = normalizeZIndices([first, second]);

    expect(normalized[0].zIndex).toBe(0);
    expect(normalized[1].zIndex).toBe(1);
    expect(first.zIndex).toBe(5);
    expect(second.zIndex).toBe(2);
  });

  it('clones elements deeply', () => {
    const elements = [createRectElement(), createRectElement()];
    const cloned = cloneElements(elements);

    expect(cloned).not.toBe(elements);
    cloned.forEach((element, index) => {
      expect(element).not.toBe(elements[index]);
      expect(element).toMatchObject(elements[index]);
    });
  });
});


