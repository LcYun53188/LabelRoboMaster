import React, { useState } from 'react';
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

interface FileBrowserPanelProps {
  imageFiles: string[];
  setImageFiles: (files: string[]) => void;
  setCurrentImageFilename: (filename: string | null) => void;
}

const FileBrowserPanel: React.FC<FileBrowserPanelProps> = ({ imageFiles, setImageFiles, setCurrentImageFilename }) => {
  const [directoryPath, setDirectoryPath] = useState('');
  const [message, setMessage] = useState('');

  const handleDirectoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDirectoryPath(event.target.value);
  };

  const selectDirectory = async () => {
    if (!directoryPath) {
      setMessage('Please enter a directory path.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/select-directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ directoryPath }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        await fetchImages(); // Fetch images once directory is set
      } else {
        setMessage(data.error || 'Failed to set directory.');
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/images');
      const data = await response.json();
      if (response.ok) {
        setImageFiles(data); // Update state in parent
        if (data.length > 0) {
          setCurrentImageFilename(data[0]); // Select first image
        } else {
          setCurrentImageFilename(null); // No images found
        }
      } else {
        setMessage(data.error || 'Failed to fetch images.');
      }
    } catch (error) {
      setMessage(`Error fetching images: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Image Files
      </Typography>
      <TextField
        label="Directory Path"
        variant="outlined"
        size="small"
        fullWidth
        value={directoryPath}
        onChange={handleDirectoryChange}
        sx={{ mb: 1 }}
      />
      <Button
        variant="contained"
        startIcon={<FolderOpenIcon />}
        onClick={selectDirectory}
        fullWidth
        sx={{ mb: 2 }}
      >
        Select Directory
      </Button>
      {message && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {message}
        </Typography>
      )}
      <List dense>
        {imageFiles.map((filename) => (
          <ListItem key={filename} disablePadding>
            <ListItemButton onClick={() => setCurrentImageFilename(filename)}>
              <ListItemText primary={filename} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FileBrowserPanel;
