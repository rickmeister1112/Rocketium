import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  Layer,
  Rect,
  Stage,
  Text as KonvaText,
  Transformer,
  Image as KonvaImage,
  Circle as KonvaCircle,
  Group,
  Line,
  Label,
  Tag,
} from 'react-konva';
import type Konva from 'konva';
import useImage from 'use-image';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectElement, updateElement } from '../../store/canvasSlice';
import type { Comment, DesignElement, ImageElement, ShapeElement, TextElement } from '../../types/design';

interface DesignCanvasProps {
  stageRef?: RefObject<Konva.Stage | null>;
  onCanvasClick?: () => void;
  onCursorMove?: (position: { x: number; y: number }) => void;
  commentMode?: boolean;
  onCommentPlacement?: (input: { x: number; y: number; screenX: number; screenY: number }) => void;
  onCommentModeExit?: () => void;
  comments?: Comment[];
  commentDraft?: { x: number; y: number; screenX: number; screenY: number } | null;
}

export const DesignCanvas = ({
  stageRef: externalStageRef,
  onCanvasClick,
  onCursorMove,
  commentMode = false,
  onCommentPlacement,
  onCommentModeExit,
  comments = [],
  commentDraft,
}: DesignCanvasProps) => {
  const dispatch = useAppDispatch();
  const { width, height, elements, selectedId } = useAppSelector((state) => state.canvas);
  const internalStageRef = useRef<Konva.Stage | null>(null);
  const stageRef = externalStageRef ?? internalStageRef;
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Record<string, Konva.Node>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [editingText, setEditingText] = useState<{
    id: string;
    value: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fill: string;
    textAlign: 'left' | 'center' | 'right';
  } | null>(null);
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);

  const COMMENT_MARKER_WIDTH = 28;
  const COMMENT_MARKER_HEIGHT = 18;
  const COMMENT_MARKER_POINTER_HEIGHT = 6;

  const measureTextWidth = (text: string, fontSize: number, fontFamily: string, fontWeight: string): number => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      return text.length * fontSize * 0.6;
    }
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    return context.measureText(text || ' ').width;
  };

  useEffect(() => {
    if (!commentMode) {
      // setCommentDraft(null); // This line is removed as per the edit hint
    }
  }, [commentMode]);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    if (selectedId) {
      const node = nodeRefs.current[selectedId];
      if (node) {
        transformer.nodes([node]);
        transformer.getLayer()?.batchDraw();
        return;
      }
    }

    transformer.nodes([]);
    transformer.getLayer()?.batchDraw();
  }, [selectedId, elements]);

  const handleSelect = (element: DesignElement): void => {
    dispatch(selectElement(element.id));
  };

  const finalizeEditing = (commit: boolean): void => {
    if (!editingText) {
      return;
    }
    if (commit) {
      const measuredWidth = measureTextWidth(
        editingText.value,
        editingText.fontSize,
        editingText.fontFamily,
        editingText.fontWeight,
      );
      const widthWithPadding = Math.max(editingText.width, measuredWidth + editingText.fontSize * 0.8);
      const lineCount = Math.max(1, editingText.value.split('\n').length);
      const heightWithPadding = Math.max(editingText.height, editingText.fontSize * 1.4 * lineCount);
      dispatch(
        updateElement({
          id: editingText.id,
          changes: {
            text: editingText.value,
            width: widthWithPadding,
            height: heightWithPadding,
          },
        }),
      );
    }
    setEditingText(null);
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    stage.draggable(!editingText);
  }, [editingText, stageRef]);

  const registerNode = (id: string, node: Konva.Node | null): void => {
    if (node) {
      nodeRefs.current[id] = node;
    } else {
      delete nodeRefs.current[id];
    }
  };

  const handleStageMouseDown = (event: Konva.KonvaEventObject<MouseEvent>): void => {
    const stage = event.target.getStage();
    if (!stage) {
      return;
    }

    if (commentMode) {
      const pointer = stage.getPointerPosition();
      const container = containerRef.current;
      if (pointer && container) {
        const bounding = container.getBoundingClientRect();
        const payload = {
          x: pointer.x,
          y: pointer.y,
          screenX: bounding.left + pointer.x,
          screenY: bounding.top + pointer.y,
        };
        onCommentPlacement?.(payload);
        onCommentModeExit?.();
      }
      event.evt.preventDefault();
      event.cancelBubble = true;
      return;
    }

    if (event.target === stage) {
      dispatch(selectElement(null));
      onCanvasClick?.();
    }
  };

  const handleDragEnd = (element: DesignElement, node: Konva.Node): void => {
    if (element.type === 'shape' && (element as ShapeElement).shapeType === 'circle') {
      const circle = element as ShapeElement;
      dispatch(
        updateElement({
          id: element.id,
          changes: {
            x: node.x() - circle.width / 2,
            y: node.y() - circle.height / 2,
          },
        }),
      );
      return;
    }
    dispatch(updateElement({ id: element.id, changes: { x: node.x(), y: node.y() } }));
  };

  const handleTransformEnd = (element: DesignElement, node: Konva.Node): void => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const width = Math.max(10, element.width * scaleX);
    const height = Math.max(10, element.height * scaleY);

    if (element.type === 'shape' && (element as ShapeElement).shapeType === 'circle') {
      const x = node.x() - width / 2;
      const y = node.y() - height / 2;
      dispatch(updateElement({ id: element.id, changes: { x, y, width, height, rotation: node.rotation() } }));
      return;
    }

    const base = {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      width,
      height,
    };

    if (element.type === 'text') {
      const textElement = element as TextElement;
      const fontSize = Math.max(12, textElement.fontSize * scaleY);
      dispatch(updateElement({ id: element.id, changes: { ...base, fontSize } }));
    } else {
      dispatch(updateElement({ id: element.id, changes: base }));
    }
  };

  const handleMouseMove = (): void => {
    if (!onCursorMove) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (pointer) {
      onCursorMove(pointer);
    }
  };

  const sortedElements = elements.slice().sort((a, b) => a.zIndex - b.zIndex);
  const overlayWidth = editingText
    ? Math.max(
        editingText.width,
        measureTextWidth(editingText.value, editingText.fontSize, editingText.fontFamily, editingText.fontWeight) +
          editingText.fontSize * 0.8,
      )
    : 0;

  return (
    <div className="design-canvas" ref={containerRef} onMouseMove={handleMouseMove}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        className="design-stage"
        onMouseDown={handleStageMouseDown}
      >
        <Layer>
          <Rect x={0} y={0} width={width} height={height} fill="#ffffff" listening={false} />
          {sortedElements.map((element) => {
            if (element.type === 'text') {
              const textElement = element as TextElement;
              return (
                <KonvaText
                  key={element.id}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  rotation={element.rotation}
                  draggable
                  text={textElement.text}
                  fontFamily={textElement.fontFamily}
                  fontSize={textElement.fontSize}
                  fontStyle={textElement.fontWeight}
                  fill={textElement.fill}
                  align={textElement.textAlign}
                  opacity={element.opacity}
                  onClick={() => handleSelect(element)}
                  onTap={() => handleSelect(element)}
                  onDblClick={() => {
                    const container = containerRef.current;
                    if (!container) {
                      return;
                    }
                    const bounding = container.getBoundingClientRect();
                    setEditingText({
                      id: element.id,
                      value: textElement.text,
                      x: bounding.left + element.x,
                      y: bounding.top + element.y,
                      width: textElement.width,
                      height: Math.max(textElement.height, textElement.fontSize * 1.4),
                      fontFamily: textElement.fontFamily,
                      fontSize: textElement.fontSize,
                      fontWeight: textElement.fontWeight,
                      fill: textElement.fill,
                      textAlign: textElement.textAlign,
                    });
                  }}
                  onDragEnd={(event) => handleDragEnd(element, event.target)}
                  onTransformEnd={(event) => handleTransformEnd(element, event.target)}
                  ref={(node) => registerNode(element.id, node)}
                />
              );
            }

            if (element.type === 'shape') {
              const shapeElement = element as ShapeElement;
              if (shapeElement.shapeType === 'circle') {
                return (
                  <KonvaCircle
                    key={element.id}
                    x={element.x + element.width / 2}
                    y={element.y + element.height / 2}
                    radius={Math.max(element.width, element.height) / 2}
                    rotation={element.rotation}
                    draggable
                    fill={shapeElement.fill}
                    stroke={shapeElement.stroke}
                    strokeWidth={shapeElement.strokeWidth}
                    opacity={element.opacity}
                    onClick={() => handleSelect(element)}
                    onTap={() => handleSelect(element)}
                    onDragEnd={(event) => handleDragEnd(element, event.target)}
                    onTransformEnd={(event) => handleTransformEnd(element, event.target)}
                    ref={(node) => registerNode(element.id, node)}
                  />
                );
              }

              return (
                <Rect
                  key={element.id}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  rotation={element.rotation}
                  draggable
                  fill={shapeElement.fill}
                  stroke={shapeElement.stroke}
                  strokeWidth={shapeElement.strokeWidth}
                  cornerRadius={shapeElement.cornerRadius ?? 0}
                  opacity={element.opacity}
                  onClick={() => handleSelect(element)}
                  onTap={() => handleSelect(element)}
                  onDragEnd={(event) => handleDragEnd(element, event.target)}
                  onTransformEnd={(event) => handleTransformEnd(element, event.target)}
                  ref={(node) => registerNode(element.id, node)}
                />
              );
            }

            return (
              <InteractiveImage
                key={element.id}
                element={element as ImageElement}
                onSelect={() => handleSelect(element)}
                onDragEnd={(node) => handleDragEnd(element, node)}
                onTransformEnd={(node) => handleTransformEnd(element, node)}
                register={(node) => registerNode(element.id, node)}
              />
            );
          })}
          {comments
            .filter((comment) => comment.x !== undefined && comment.y !== undefined)
            .map((comment) => {
              const initials = comment.authorName
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part.charAt(0).toUpperCase())
                .join('');

              return (
                <Group
                  key={`comment-marker-${comment.id}`}
                  x={comment.x!}
                  y={comment.y!}
                  onMouseEnter={() => setHoveredCommentId(comment.id)}
                  onMouseLeave={() =>
                    setHoveredCommentId((current) => (current === comment.id ? null : current))
                  }
                >
                  <Rect
                    x={-COMMENT_MARKER_WIDTH / 2}
                    y={-(COMMENT_MARKER_HEIGHT + COMMENT_MARKER_POINTER_HEIGHT)}
                    width={COMMENT_MARKER_WIDTH}
                    height={COMMENT_MARKER_HEIGHT}
                    cornerRadius={6}
                    fill="#fb923c"
                    stroke="#c2410c"
                    strokeWidth={1}
                    shadowColor="rgba(17,24,39,0.2)"
                    shadowBlur={6}
                    shadowOffset={{ x: 0, y: 2 }}
                    shadowOpacity={0.45}
                  />
                  <Line
                    points={[
                      -6,
                      -COMMENT_MARKER_POINTER_HEIGHT,
                      0,
                      0,
                      6,
                      -COMMENT_MARKER_POINTER_HEIGHT,
                    ]}
                    closed
                    fill="#fb923c"
                    stroke="#c2410c"
                    strokeWidth={1}
                  />
                  <KonvaText
                    text={initials || '💬'}
                    x={-COMMENT_MARKER_WIDTH / 2}
                    y={-(COMMENT_MARKER_HEIGHT + COMMENT_MARKER_POINTER_HEIGHT)}
                    width={COMMENT_MARKER_WIDTH}
                    height={COMMENT_MARKER_HEIGHT}
                    align="center"
                    verticalAlign="middle"
                    fontSize={12}
                    fontStyle="700"
                    fill="#1f2937"
                    padding={4}
                  />
                  {hoveredCommentId === comment.id && (
                    <Label
                      x={0}
                      y={-(COMMENT_MARKER_HEIGHT + COMMENT_MARKER_POINTER_HEIGHT + 10)}
                      listening={false}
                    >
                      <Tag
                        fill="rgba(17,24,39,0.92)"
                        pointerDirection="down"
                        pointerWidth={10}
                        pointerHeight={6}
                        cornerRadius={6}
                      />
                      <KonvaText
                        text={`${comment.authorName}\n${comment.message}`}
                        fontSize={12}
                        fill="#f9fafb"
                        padding={8}
                        lineHeight={1.3}
                        width={220}
                        wrap="word"
                      />
                    </Label>
                  )}
                </Group>
              );
            })}
          <Transformer
            ref={transformerRef}
            rotateEnabled
            enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          />
        </Layer>
      </Stage>
      {commentDraft && (
        <div
          className="comment-target-indicator"
          style={{ top: commentDraft.screenY - 8, left: commentDraft.screenX - 8 }}
        />
      )}
      {editingText && (
        <textarea
          className="text-editor-overlay"
          style={{
            position: 'fixed',
            top: `${editingText.y}px`,
            left: `${editingText.x}px`,
            width: `${overlayWidth}px`,
            minHeight: `${editingText.height}px`,
            padding: '0.25rem',
            borderRadius: '6px',
            border: '1px solid rgba(17,24,39,0.2)',
            background: '#ffffff',
            zIndex: 1000,
            fontFamily: editingText.fontFamily,
            fontSize: `${editingText.fontSize}px`,
            fontWeight: editingText.fontWeight,
            color: editingText.fill,
            textAlign: editingText.textAlign,
            lineHeight: 1.4,
            resize: 'none',
          }}
          value={editingText.value}
          autoFocus
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            setEditingText((current) => {
              if (!current) {
                return current;
              }
              const measuredWidth = measureTextWidth(
                nextValue,
                current.fontSize,
                current.fontFamily,
                current.fontWeight,
              );
              const lineCount = Math.max(1, nextValue.split('\n').length);
              return {
                ...current,
                value: nextValue,
                width: Math.max(current.width, measuredWidth + current.fontSize * 0.8),
                height: Math.max(current.height, current.fontSize * 1.4 * lineCount),
              };
            });
          }}
          onBlur={() => finalizeEditing(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              finalizeEditing(true);
            } else if (event.key === 'Escape') {
              finalizeEditing(false);
            }
          }}
        />
      )}
    </div>
  );
};

interface InteractiveImageProps {
  element: ImageElement;
  onSelect: () => void;
  onDragEnd: (node: Konva.Node) => void;
  onTransformEnd: (node: Konva.Node) => void;
  register: (node: Konva.Node | null) => void;
}

const InteractiveImage = ({ element, onSelect, onDragEnd, onTransformEnd, register }: InteractiveImageProps) => {
  const [image] = useImage((element as ImageElement).url, 'anonymous');

  return (
    <KonvaImage
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      draggable
      image={image ?? undefined}
      opacity={element.opacity}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(event) => onDragEnd(event.target)}
      onTransformEnd={(event) => onTransformEnd(event.target)}
      ref={(node) => register(node)}
    />
  );
};