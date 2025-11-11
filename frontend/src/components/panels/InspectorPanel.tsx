import type { ChangeEvent } from 'react';

import { updateElement } from '../../store/canvasSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { DesignElement, ShapeElement, TextElement } from '../../types/design';
import { FONT_WEIGHTS, TEXT_ALIGNMENTS } from '../../types/enums';

const numberValue = (value: string, fallback: number): number => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toLabel = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

export const InspectorPanel = () => {
  const dispatch = useAppDispatch();
  const { elements, selectedId } = useAppSelector((state) => state.canvas);

  const element = elements.find((item) => item.id === selectedId);
  if (!element) {
    return (
      <aside className="inspector-panel empty">
        <p>Select a layer to edit its properties</p>
      </aside>
    );
  }

  const update = (changes: Partial<DesignElement>): void => {
    dispatch(updateElement({ id: element.id, changes }));
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>, key: keyof DesignElement) => {
    const target = event.currentTarget;
    if (target.type === 'number' || target.type === 'range') {
      update({ [key]: numberValue(target.value, Number(element[key])) } as Partial<DesignElement>);
    } else {
      update({ [key]: target.value } as Partial<DesignElement>);
    }
  };

  const renderSpecificFields = () => {
    if (element.type === 'text') {
      const textElement = element as TextElement;
      return (
        <section>
          <label>
            Text
            <input
              type="text"
              value={textElement.text}
              onChange={(event) => update({ text: event.currentTarget.value })}
            />
          </label>
          <label>
            Font size
            <input
              type="number"
              min={8}
              value={textElement.fontSize}
              onChange={(event) => update({ fontSize: numberValue(event.currentTarget.value, textElement.fontSize) })}
            />
          </label>
          <label>
            Font weight
            <select
              value={textElement.fontWeight}
              onChange={(event) => update({ fontWeight: event.currentTarget.value as TextElement['fontWeight'] })}
            >
              {FONT_WEIGHTS.map((weight) => (
                <option key={weight} value={weight}>
                  {toLabel(weight)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fill
            <input type="color" value={textElement.fill} onChange={(event) => update({ fill: event.currentTarget.value })} />
          </label>
          <label>
            Align
            <select
              value={textElement.textAlign}
              onChange={(event) => update({ textAlign: event.currentTarget.value as TextElement['textAlign'] })}
            >
              {TEXT_ALIGNMENTS.map((alignment) => (
                <option key={alignment} value={alignment}>
                  {toLabel(alignment)}
                </option>
              ))}
            </select>
          </label>
        </section>
      );
    }

    if (element.type === 'shape') {
      const shape = element as ShapeElement;
      return (
        <section>
          <label>
            Fill
            <input type="color" value={shape.fill} onChange={(event) => update({ fill: event.currentTarget.value })} />
          </label>
          <label>
            Stroke
            <input type="color" value={shape.stroke} onChange={(event) => update({ stroke: event.currentTarget.value })} />
          </label>
          <label>
            Stroke width
            <input
              type="number"
              min={0}
              value={shape.strokeWidth}
              onChange={(event) => update({ strokeWidth: numberValue(event.currentTarget.value, shape.strokeWidth) })}
            />
          </label>
        </section>
      );
    }

    if (element.type === 'image') {
      return (
        <section>
          <label>
            Image URL
            <input type="text" value={element.url} onChange={(event) => update({ url: event.currentTarget.value })} />
          </label>
        </section>
      );
    }

    return null;
  };

  return (
    <aside className="inspector-panel">
      <header>
        <h2>Inspector</h2>
        <span>{element.type.toUpperCase()}</span>
      </header>

      <section className="inspector-grid">
        <label>
          X
          <input type="number" value={element.x} onChange={(event) => handleInput(event, 'x')} />
        </label>
        <label>
          Y
          <input type="number" value={element.y} onChange={(event) => handleInput(event, 'y')} />
        </label>
        <label>
          Width
          <input type="number" value={element.width} onChange={(event) => handleInput(event, 'width')} />
        </label>
        <label>
          Height
          <input type="number" value={element.height} onChange={(event) => handleInput(event, 'height')} />
        </label>
        <label>
          Rotation
          <input type="number" value={element.rotation} onChange={(event) => handleInput(event, 'rotation')} />
        </label>
        <label>
          Opacity
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={element.opacity}
            onChange={(event) => update({ opacity: Number(event.currentTarget.value) })}
          />
        </label>
      </section>

      {renderSpecificFields()}
    </aside>
  );
};

