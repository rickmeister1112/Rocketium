import { describe, expect, it } from 'vitest';

import {
  addElement,
  canvasReducer,
  redo,
  removeElement,
  selectElement,
  setDesign,
  undo,
} from '../store/canvasSlice';
import type { Design } from '../types/design';
import { createRectElement } from '../utils/elements';

const baseDesign: Design = {
  id: 'design-1',
  name: 'Test design',
  width: 1080,
  height: 1080,
  elements: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('canvasSlice', () => {
  it('loads a design and selects layers', () => {
    const state = canvasReducer(undefined, setDesign(baseDesign));
    expect(state.designId).toBe(baseDesign.id);
    expect(state.elements).toHaveLength(0);
  });

  it('adds and removes elements with history', () => {
    const element = createRectElement();
    let state = canvasReducer(undefined, setDesign(baseDesign));
    state = canvasReducer(state, addElement(element));

    expect(state.elements).toHaveLength(1);
    expect(state.history).toHaveLength(2);

    state = canvasReducer(state, removeElement(state.elements[0].id));
    expect(state.elements).toHaveLength(0);
    expect(state.history).toHaveLength(3);
  });

  it('supports undo and redo', () => {
    let state = canvasReducer(undefined, setDesign(baseDesign));
    state = canvasReducer(state, addElement(createRectElement()));
    const initialId = state.elements[0].id;

    state = canvasReducer(state, addElement(createRectElement()));
    expect(state.elements).toHaveLength(2);

    state = canvasReducer(state, undo());
    expect(state.elements).toHaveLength(1);
    expect(state.elements[0].id).toBe(initialId);

    state = canvasReducer(state, redo());
    expect(state.elements).toHaveLength(2);
  });

  it('selects element', () => {
    let state = canvasReducer(undefined, setDesign(baseDesign));
    state = canvasReducer(state, addElement(createRectElement()));
    const id = state.elements[0].id;

    state = canvasReducer(state, selectElement(id));
    expect(state.selectedId).toBe(id);
  });
});

