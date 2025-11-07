import { useMemo, useState } from 'react';

import { removeElement, reorderElement, selectElement, updateElement } from '../../store/canvasSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

export const LayersPanel = () => {
  const dispatch = useAppDispatch();
  const { elements, selectedId } = useAppSelector((state) => state.canvas);
  const [editingId, setEditingId] = useState<string | null>(null);
  const sorted = useMemo(() => elements.slice().sort((a, b) => b.zIndex - a.zIndex), [elements]);

  const typeLabel = (type: string): string => {
    switch (type) {
      case 'text':
        return 'T';
      case 'image':
        return 'I';
      case 'shape':
        return 'S';
      default:
        return '?';
    }
  };

  const handleRename = (id: string, name: string): void => {
    const trimmed = name.trim();
    dispatch(updateElement({ id, changes: { name: trimmed || 'Layer' } }));
    setEditingId(null);
  };

  return (
    <aside className="layers-panel">
      <header>
        <h2>Layers</h2>
      </header>
      <ul>
        {sorted.map((layer, position) => (
          <li key={layer.id} className={selectedId === layer.id ? 'selected' : ''}>
            <button
              type="button"
              className="layer-row"
              onClick={() => dispatch(selectElement(layer.id))}
              onDoubleClick={() => setEditingId(layer.id)}
            >
              <span className={`layer-chip layer-chip-${layer.type}`}>{typeLabel(layer.type)}</span>
              <span className="layer-index">#{sorted.length - position}</span>
              {editingId === layer.id ? (
                <input
                  type="text"
                  autoFocus
                  defaultValue={layer.name}
                  onBlur={(event) => handleRename(layer.id, event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleRename(layer.id, event.currentTarget.value);
                    }
                  }}
                />
              ) : (
                <span>{layer.name}</span>
              )}
            </button>
            <div className="layer-actions">
              <button className="layer-action" type="button" onClick={() => setEditingId(layer.id)} aria-label="Rename layer">
                ✏️
              </button>
              <button
                className="layer-action"
                type="button"
                onClick={() => dispatch(reorderElement({ id: layer.id, operation: 'front' }))}
                aria-label="Bring to front"
                title="Bring to front"
              >
                ⇡
              </button>
              <button
                className="layer-action"
                type="button"
                onClick={() => dispatch(reorderElement({ id: layer.id, operation: 'forward' }))}
                aria-label="Bring forward"
                title="Bring forward"
              >
                ↑
              </button>
              <button
                className="layer-action"
                type="button"
                onClick={() => dispatch(reorderElement({ id: layer.id, operation: 'backward' }))}
                aria-label="Send backward"
                title="Send backward"
              >
                ↓
              </button>
              <button
                className="layer-action"
                type="button"
                onClick={() => dispatch(reorderElement({ id: layer.id, operation: 'back' }))}
                aria-label="Send to back"
                title="Send to back"
              >
                ⇣
              </button>
              <button
                className="layer-action"
                type="button"
                onClick={() => dispatch(removeElement(layer.id))}
                aria-label="Delete layer"
                title="Delete layer"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
        {sorted.length === 0 && <li className="empty">No layers yet</li>}
      </ul>
    </aside>
  );
};

