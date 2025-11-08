import type Konva from 'konva';
import { nanoid } from 'nanoid';
import { useMemo, useRef, type ChangeEvent, type RefObject } from 'react';

import { addElement, redo, setName, undo } from '../../store/canvasSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveDesign } from '../../store/thunks';
import { createCircleElement, createRectElement, createTextElement } from '../../utils/elements';
import { UserNameControl } from '../common/UserNameControl';
import type { PresenceUser } from '../../types/design';

interface TopBarProps {
  stageRef: RefObject<Konva.Stage | null>;
  commentMode: boolean;
  onToggleCommentMode: () => void;
  collaborators: PresenceUser[];
}

const initialsFor = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
};

export const TopBar = ({ stageRef, commentMode, onToggleCommentMode, collaborators }: TopBarProps) => {
  const dispatch = useAppDispatch();
  const name = useAppSelector((state) => state.canvas.name);
  const historyLength = useAppSelector((state) => state.canvas.history.length);
  const futureLength = useAppSelector((state) => state.canvas.future.length);
  const dirty = useAppSelector((state) => state.canvas.dirty);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canUndo = useMemo(() => historyLength > 1, [historyLength]);
  const canRedo = useMemo(() => futureLength > 0, [futureLength]);

  const handleAddText = (): void => {
    dispatch(addElement(createTextElement()));
  };

  const handleAddRect = (): void => {
    dispatch(addElement(createRectElement()));
  };

  const handleAddCircle = (): void => {
    dispatch(addElement(createCircleElement()));
  };

  const handleImageButtonClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleImageSelected = (event: ChangeEvent<HTMLInputElement>): void => {
    const [file] = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const image = new Image();
      image.onload = () => {
        const maxDimension = 400;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const width = Math.max(50, image.width * scale);
        const height = Math.max(50, image.height * scale);

        dispatch(
          addElement({
            id: nanoid(),
            type: 'image',
            name: file.name || 'Image',
            url: dataUrl,
            x: 200,
            y: 200,
            width,
            height,
            rotation: 0,
            zIndex: 0,
            opacity: 1,
            fit: 'contain',
          }),
        );
      };
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (): void => {
    const stage = stageRef.current;
    if (!stage) return;
    const dataUrl = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `${name}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <header className="top-bar">
      <div className="title">
        <input value={name} onChange={(event) => dispatch(setName(event.currentTarget.value))} />
        {dirty && <span className="dirty-indicator">●</span>}
      </div>
      <div className="actions tool-actions">
        <button type="button" onClick={handleAddText}>
          Text
        </button>
        <button type="button" onClick={handleImageButtonClick}>
          Image
        </button>
        <button type="button" onClick={handleAddRect}>
          Rect
        </button>
        <button type="button" onClick={handleAddCircle}>
          Circle
        </button>
        <button type="button" className={commentMode ? 'action-toggle-selected' : ''} onClick={onToggleCommentMode}>
          Comment
        </button>
      </div>
      <div className="actions secondary-actions">
        <button type="button" onClick={() => dispatch(undo())} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" onClick={() => dispatch(redo())} disabled={!canRedo}>
          Redo
        </button>
        <button type="button" onClick={() => dispatch(saveDesign())}>
          Save
        </button>
        <button type="button" onClick={handleDownload}>
          Download PNG
        </button>
      </div>
      {collaborators.length > 0 && (
        <div className="collaborator-group">
          {collaborators.slice(0, 3).map((member) => (
            <span
              key={member.userId}
              className="collaborator-chip"
              style={{ backgroundColor: member.color }}
              title={member.name}
            >
              {initialsFor(member.name)}
            </span>
          ))}
          {collaborators.length > 3 && (
            <span className="collaborator-chip collaborator-chip--overflow" title={`${collaborators.length - 3} more`}>
              +{collaborators.length - 3}
            </span>
          )}
        </div>
      )}
      <UserNameControl />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageSelected}
      />
    </header>
  );
};

