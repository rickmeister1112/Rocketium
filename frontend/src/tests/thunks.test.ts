import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setDesign, setLoading } from '../store/canvasSlice';
import { showToast } from '../store/uiSlice';
import { loadDesign, saveDesign } from '../store/thunks';
import type { RootState } from '../store';

vi.mock('../services/designs', () => {
  return {
    DesignApi: {
      list: vi.fn(),
      create: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      listComments: vi.fn(),
      createComment: vi.fn(),
      updateComment: vi.fn(),
    },
  };
});

const { DesignApi } = await import('../services/designs');

const mockedDesignApi = DesignApi as unknown as {
  get: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

const DEFAULT_DESIGN_ID = 'design-123';
const DEFAULT_DESIGN_NAME = 'Design name';

const makeState = (override?: Partial<RootState['canvas']>): RootState => ({
  canvas: {
    designId: DEFAULT_DESIGN_ID,
    name: DEFAULT_DESIGN_NAME,
    width: 800,
    height: 600,
    elements: [],
    dirty: true,
    history: [],
    future: [],
    loading: false,
    selectedId: null,
    version: 0,
    ...override,
  },
  designs: { items: [], loading: false },
  comments: { items: [], loading: false },
  presence: { users: [], cursors: {} },
  ui: {},
});

describe('store thunks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads a design and toggles loading state', async () => {
    const design = { id: 'design-1' };
    mockedDesignApi.get.mockResolvedValue(design);

    const dispatch = vi.fn();
    const getState = vi.fn();

    const result = await loadDesign('design-1')(dispatch, getState, undefined);

    expect(mockedDesignApi.get).toHaveBeenCalledWith('design-1');
    expect(result.type).toBe('canvas/loadDesign/fulfilled');
    expect(result.payload).toEqual(design);
    expect(dispatch).toHaveBeenCalledWith(setLoading(true));
    expect(dispatch).toHaveBeenCalledWith(setDesign(design as never));
    expect(dispatch).toHaveBeenCalledWith(setLoading(false));
  });

  it('propagates load errors but still clears loading', async () => {
    mockedDesignApi.get.mockRejectedValue(new Error('network'));
    const dispatch = vi.fn();

    const result = await loadDesign('broken')(dispatch, vi.fn(), undefined);
    expect(result.type).toBe('canvas/loadDesign/rejected');
    expect(dispatch).toHaveBeenCalledWith(setLoading(true));
    expect(dispatch).toHaveBeenCalledWith(setLoading(false));
  });

  it('saves design and triggers toast & refresh by default', async () => {
    mockedDesignApi.update.mockResolvedValue({ id: DEFAULT_DESIGN_ID });
    const dispatch = vi.fn();

    const result = await saveDesign(undefined)(dispatch, () => makeState(), undefined);

    expect(result.type).toBe('canvas/saveDesign/fulfilled');
    expect(result.payload).toEqual({ id: DEFAULT_DESIGN_ID });
    expect(mockedDesignApi.update).toHaveBeenCalledWith(DEFAULT_DESIGN_ID, {
      name: DEFAULT_DESIGN_NAME,
      width: 800,
      height: 600,
      elements: [],
    });

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'canvas/markSaved' }));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: showToast.type }));
    expect(dispatch.mock.calls.some(([arg]) => typeof arg === 'function')).toBe(true);
  });

  it('omits toast when saving silently', async () => {
    mockedDesignApi.update.mockResolvedValue({ id: DEFAULT_DESIGN_ID });
    const dispatch = vi.fn();

    await saveDesign({ silent: true })(dispatch, () => makeState(), undefined);

    const toastCall = dispatch.mock.calls.find(([action]) => action?.type === showToast.type);
    expect(toastCall).toBeUndefined();
  });

  it('short-circuits save when designId is missing', async () => {
    const dispatch = vi.fn();
    const result = await saveDesign(undefined)(
      dispatch,
      () => makeState({ designId: null }),
      undefined,
    );

    expect(result.type).toBe('canvas/saveDesign/fulfilled');
    expect(result.payload).toBeNull();
    expect(mockedDesignApi.update).not.toHaveBeenCalled();
    expect(dispatch.mock.calls.every(([action]) => action?.type !== 'canvas/markSaved')).toBe(true);
  });
});


