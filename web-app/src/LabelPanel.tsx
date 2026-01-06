import React from 'react';
import { Box, Typography, Button, List, ListItem, ListItemButton, ListItemText, ListItemSecondaryAction, IconButton, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Polygon } from './App'; // Import types from App

// Define the class and color maps based on the README.md
const classMap = [
  { id: 0, label: 'G (哨兵)' },
  { id: 1, label: '1 (一号)' },
  { id: 2, label: '2 (二号)' },
  { id: 3, label: '3 (三号)' },
  { id: 4, label: '4 (四号)' },
  { id: 5, label: '5 (五号)' },
  { id: 6, label: 'O (前哨站)' },
  { id: 7, label: 'Bs (基地)' },
  { id: 8, label: 'Bb (基地大装甲)' },
  { id: 9, label: 'L3 (三号平衡)' },
  { id: 10, label: 'L4 (四号平衡)' },
  { id: 11, label: 'L5 (五号平衡)' },
];

const colorMap = [
  { id: 0, label: 'Blue', hex: '#2196f3' },
  { id: 1, label: 'Red', hex: '#f44336' },
  { id: 2, label: 'N (熄灭)', hex: '#bdbdbd' },
  { id: 3, label: 'Purple', hex: '#9c27b0' },
];

interface LabelPanelProps {
  polygons: Polygon[];
  selectedPolygonId: string | null;
  setSelectedPolygonId: (id: string | null) => void;
  setPolygons: (polygons: Polygon[]) => void;
}

const LabelPanel: React.FC<LabelPanelProps> = ({ polygons, selectedPolygonId, setSelectedPolygonId, setPolygons }) => {
  const selectedPolygon = polygons.find((p) => p.id === selectedPolygonId);

  const handlePolygonClick = (id: string) => {
    setSelectedPolygonId(id === selectedPolygonId ? null : id);
  };

  const handleDelete = (id: string) => {
    setPolygons(polygons.filter(p => p.id !== id));
    if (selectedPolygonId === id) {
      setSelectedPolygonId(null);
    }
  };

  const handlePropertyChange = (property: 'label' | 'classId' | 'colorId', value: string | number) => {
    if (selectedPolygonId) {
      const updatedPolygons = polygons.map(p => {
        if (p.id === selectedPolygonId) {
          const updatedPolygon = { ...p, [property]: value };
          if (property === 'colorId') {
            updatedPolygon.color = colorMap.find(c => c.id === value)?.hex;
          }
          return updatedPolygon;
        }
        return p;
      });
      setPolygons(updatedPolygons);
    }
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Labels ({polygons.length})
      </Typography>
      <List dense sx={{ flexGrow: 1, overflow: 'auto' }}>
        {polygons.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No labels found for this image.
          </Typography>
        ) : (
          polygons.map((polygon, index) => (
            <ListItem
              key={polygon.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(polygon.id)}>
                  <DeleteIcon />
                </IconButton>
              }
              disablePadding
            >
              <ListItemButton
                selected={polygon.id === selectedPolygonId}
                onClick={() => handlePolygonClick(polygon.id)}
              >
                <ListItemText
                  primary={`Polygon ${polygon.label || (index + 1)}`}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      ID: {polygon.classId !== undefined ? classMap.find(c => c.id === polygon.classId)?.label : 'N/A'}
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          ml: 1,
                          bgcolor: polygon.color || 'gray',
                          borderRadius: '50%',
                          border: '1px solid white',
                        }}
                      />
                      {polygon.colorId !== undefined ? colorMap.find(c => c.id === polygon.colorId)?.label : 'N/A'}
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>

      {selectedPolygon && (
        <Box sx={{ mt: 3, p: 2, border: '1px solid gray', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Edit Polygon
          </Typography>
          <TextField
            label="Label"
            variant="outlined"
            size="small"
            fullWidth
            value={selectedPolygon.label || ''}
            onChange={(e) => handlePropertyChange('label', e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Class ID</InputLabel>
            <Select
              value={selectedPolygon.classId === undefined ? '' : selectedPolygon.classId}
              label="Class ID"
              onChange={(e) => handlePropertyChange('classId', e.target.value as number)}
            >
              {classMap.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Color ID</InputLabel>
            <Select
              value={selectedPolygon.colorId === undefined ? '' : selectedPolygon.colorId}
              label="Color ID"
              onChange={(e) => handlePropertyChange('colorId', e.target.value as number)}
            >
              {colorMap.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        bgcolor: item.hex,
                        borderRadius: '50%',
                        mr: 1,
                        border: '1px solid white',
                      }}
                    />
                    {item.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  );
};

export default LabelPanel;
