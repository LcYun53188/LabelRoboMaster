import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle, Group } from 'react-konva';
import useImage from 'use-image';
import { Box, Typography } from '@mui/material';
import type { Polygon, Point } from './App';

interface AnnotationCanvasProps {
  currentImageFilename: string | null;
  polygons: Polygon[];
  setPolygons: (polygons: Polygon[]) => void;
  selectedPolygonId: string | null;
  setSelectedPolygonId: (id: string | null) => void;
  mode: string;
}

const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  currentImageFilename,
  polygons,
  setPolygons,
  selectedPolygonId,
  setSelectedPolygonId,
  mode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [groupPos, setGroupPos] = useState({ x: 0, y: 0 });
  const [groupScale, setGroupScale] = useState(1);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);

  const imageUrl = currentImageFilename ? `http://localhost:3001/api/image/${encodeURIComponent(currentImageFilename)}` : '';
  const [image] = useImage(imageUrl, 'anonymous');

  // Set container size on mount and resize
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Center and fit image when it loads or container resizes
  useEffect(() => {
    if (image && containerSize.width > 0) {
      const scale = Math.min(containerSize.width / image.width, containerSize.height / image.height);
      setGroupScale(scale);
      setGroupPos({
        x: (containerSize.width - image.width * scale) / 2,
        y: (containerSize.height - image.height * scale) / 2,
      });
      // Clear annotations when image changes
      setPolygons([]);
      setSelectedPolygonId(null);
      setDrawingPoints([]);
    }
  }, [image, containerSize, setPolygons, setSelectedPolygonId]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const group = e.target.getStage().findOne('Group');
    const oldScale = group.scaleX();
    const pointer = group.getRelativePointerPosition();
    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;

    setGroupScale(newScale);
    setGroupPos({
      x: pointer.x - (pointer.x - group.x()) * (newScale / oldScale),
      y: pointer.y - (pointer.y - group.y()) * (newScale / oldScale),
    });
  };

  const handleStageClick = (e: any) => {
    if (e.target.name() === 'polygon' || e.target.name() === 'anchor') {
      return;
    }

    if (mode !== 'draw' || !image) {
      setSelectedPolygonId(null);
      return;
    }

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    const x = (pos.x - groupPos.x) / groupScale;
    const y = (pos.y - groupPos.y) / groupScale;

    setDrawingPoints(prev => {
      const newPoints = [...prev, { x, y }];
      if (newPoints.length === 4) {
        setPolygons([...polygons, { id: `poly-${Date.now()}`, points: newPoints, color: 'red' }]);
        return [];
      }
      return newPoints;
    });
  };
  
  const handlePolygonClick = (e: any, polygonId: string) => {
    e.cancelBubble = true;
    setSelectedPolygonId(polygonId);
  };
  
  const handlePointDragMove = (e: any, polygonId: string, pointIndex: number) => {
    const newPoints = [...polygons.find(p => p.id === polygonId)!.points];
    newPoints[pointIndex] = { x: e.target.x(), y: e.target.y() };
    const newPolygons = polygons.map(p => p.id === polygonId ? { ...p, points: newPoints } : p);
    setPolygons(newPolygons);
  };

  const handleGroupDragEnd = (e: any) => {
    setGroupPos({ x: e.target.x(), y: e.target.y() });
  };


  if (!currentImageFilename) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h4" color="text.secondary">No image selected</Typography>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', position: 'relative', bgcolor: 'background.paper' }}>
      <Stage
        width={containerSize.width}
        height={containerSize.height}
        onWheel={handleWheel}
        onClick={handleStageClick}
      >
        <Layer>
          <Group
            x={groupPos.x}
            y={groupPos.y}
            scaleX={groupScale}
            scaleY={groupScale}
            draggable
            onDragEnd={handleGroupDragEnd}
          >
            {image && <KonvaImage image={image} />}
            
            {/* Render existing polygons */}
            {polygons.map((poly) => (
              <Line
                key={poly.id}
                name="polygon"
                points={poly.points.flatMap(p => [p.x, p.y])}
                stroke={poly.id === selectedPolygonId ? 'cyan' : poly.color || 'red'}
                strokeWidth={2}
                closed
                onClick={(e) => handlePolygonClick(e, poly.id)}
                onTap={(e) => handlePolygonClick(e, poly.id)}
              />
            ))}

            {/* Render anchors for selected polygon */}
            {polygons.filter(p => p.id === selectedPolygonId).map(poly => 
              poly.points.map((point, index) => (
                <Circle
                  key={`${poly.id}-${index}`}
                  name="anchor"
                  x={point.x}
                  y={point.y}
                  radius={6 / groupScale} // Keep anchor size consistent on zoom
                  fill="white"
                  stroke="black"
                  strokeWidth={2 / groupScale}
                  draggable
                  onDragMove={(e) => handlePointDragMove(e, poly.id, index)}
                />
              ))
            )}
            
            {/* Render currently drawing points */}
            {drawingPoints.map((point, i) => (
              <Circle key={`draw-${i}`} x={point.x} y={point.y} radius={5 / groupScale} fill="yellow" />
            ))}

          </Group>
        </Layer>
      </Stage>
    </Box>
  );
};

export default AnnotationCanvas;
