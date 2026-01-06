import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Drawer, CssBaseline, Button, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import MenuIcon from '@mui/icons-material/Menu';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FileBrowserPanel from './FileBrowserPanel';
import AnnotationCanvas from './AnnotationCanvas';
import LabelPanel from './LabelPanel';

// Define interfaces locally now
export interface Point {
  x: number;
  y: number;
}

export interface Polygon {
  id: string;
  points: Point[];
  label?: string;
  classId?: number;
  colorId?: number;
  color?: string;
}

interface AnnotationWorkspaceProps {
  currentImageFilename: string | null;
  polygons: Polygon[];
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
  selectedPolygonId: string | null;
  setSelectedPolygonId: React.Dispatch<React.SetStateAction<string | null>>;
  mode: string;
}

const AnnotationWorkspace: React.FC<AnnotationWorkspaceProps> = (props) => (
  <Box
    sx={{
      flexGrow: 1,
      p: 3,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: 'background.default',
      overflow: 'auto',
    }}
  >
    <AnnotationCanvas
      currentImageFilename={props.currentImageFilename}
      polygons={props.polygons}
      setPolygons={props.setPolygons}
      selectedPolygonId={props.selectedPolygonId}
      setSelectedPolygonId={props.setSelectedPolygonId}
      mode={props.mode}
    />
  </Box>
);

const drawerWidth = 240;

function App() {
  // All state is now managed in the App component
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [currentImageFilename, setCurrentImageFilename] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [mode, setMode] = useState('draw');
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(null);

  const handleLeftDrawerToggle = () => {
    setLeftDrawerOpen(!leftDrawerOpen);
  };

  const handleRightDrawerToggle = () => {
    setRightDrawerOpen(!rightDrawerOpen);
  };

  const handleSave = async () => {
    if (!currentImageFilename) {
      console.warn("No image selected to save.");
      return;
    }
    if (polygons.length === 0) {
      console.warn("No polygons to save.");
      // Still attempt to save an empty file to clear labels if needed
    }

    const formattedLabels = polygons.map(poly => {
      const points = poly.points.map(p => `${Math.round(p.x)} ${Math.round(p.y)}`).join(' ');
      const classId = poly.classId !== undefined ? poly.classId : 0;
      const colorId = poly.colorId !== undefined ? poly.colorId : 0;
      return `${points} ${classId} ${colorId}`;
    }).join('\n');

    try {
      await fetch(`http://localhost:3001/api/label/${encodeURIComponent(currentImageFilename)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formattedLabels }),
      });
    } catch (error) {
      console.error('Error saving labels:', error);
    }
  };

  const handlePreviousImage = async () => {
    await handleSave();
    if (currentImageFilename && imageFiles.length > 0) {
      const currentIndex = imageFiles.indexOf(currentImageFilename);
      if (currentIndex > 0) {
        setCurrentImageFilename(imageFiles[currentIndex - 1]);
      }
    }
  };

  const handleNextImage = async () => {
    await handleSave();
    if (currentImageFilename && imageFiles.length > 0) {
      const currentIndex = imageFiles.indexOf(currentImageFilename);
      if (currentIndex < imageFiles.length - 1) {
        setCurrentImageFilename(imageFiles[currentIndex + 1]);
      }
    }
  };

  const handleChangeMode = (event: SelectChangeEvent<string>) => {
    setMode(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, width: '100%' }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open left drawer" edge="start" onClick={handleLeftDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            LabelMaster Web
          </Typography>
          <Button color="inherit" startIcon={<ArrowBackIosNewIcon />} onClick={handlePreviousImage}>Prev</Button>
          <Button color="inherit" startIcon={<ArrowForwardIosIcon />} onClick={handleNextImage}>Next</Button>
          <Button color="inherit" startIcon={<SaveIcon />} onClick={handleSave}>Save</Button>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120, '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'white' } }}>
            <InputLabel id="mode-select-label">Mode</InputLabel>
            <Select labelId="mode-select-label" id="mode-select" value={mode} label="Mode" onChange={handleChangeMode}>
              <MenuItem value="draw">Draw</MenuItem>
              <MenuItem value="select">Select</MenuItem>
            </Select>
          </FormControl>
          <IconButton color="inherit" aria-label="open right drawer" edge="end" onClick={handleRightDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer variant="persistent" anchor="left" open={leftDrawerOpen} sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', position: 'absolute', height: 'calc(100% - 64px)', top: '64px', left: 0 } }}>
        <FileBrowserPanel
          imageFiles={imageFiles}
          setImageFiles={setImageFiles}
          setCurrentImageFilename={setCurrentImageFilename}
        />
      </Drawer>

      <Drawer variant="persistent" anchor="right" open={rightDrawerOpen} sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', position: 'absolute', height: 'calc(100% - 64px)', top: '64px', right: 0 } }}>
        <LabelPanel
          polygons={polygons}
          selectedPolygonId={selectedPolygonId}
          setSelectedPolygonId={setSelectedPolygonId}
          setPolygons={setPolygons}
        />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: leftDrawerOpen ? `${drawerWidth}px` : 0, mr: rightDrawerOpen ? `${drawerWidth}px` : 0, width: `calc(100% - ${leftDrawerOpen ? drawerWidth : 0}px - ${rightDrawerOpen ? drawerWidth : 0}px)`, transition: (theme) => theme.transitions.create(['margin', 'width'], { easing: theme.transitions.easing.easeOut, duration: theme.transitions.duration.enteringScreen, }), marginTop: '64px' }}>
        <AnnotationWorkspace
          currentImageFilename={currentImageFilename}
          polygons={polygons}
          setPolygons={setPolygons}
          selectedPolygonId={selectedPolygonId}
          setSelectedPolygonId={setSelectedPolygonId}
          mode={mode}
        />
      </Box>
    </Box>
  );
}

export default App;
