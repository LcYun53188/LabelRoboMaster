const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001; // Backend server port

app.use(cors());
app.use(express.json()); // To parse JSON request bodies

let currentImageDirectory = '';

// API to set the image directory
app.post('/api/select-directory', (req, res) => {
    const { directoryPath } = req.body;
    if (!directoryPath) {
        return res.status(400).json({ error: 'directoryPath is required' });
    }

    // Basic validation: check if the path exists and is a directory
    if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
        return res.status(400).json({ error: 'Invalid or non-existent directory' });
    }

    currentImageDirectory = directoryPath;
    console.log(`Image directory set to: ${currentImageDirectory}`);
    res.json({ message: `Directory set to ${currentImageDirectory}` });
});

// API to list images in the current directory
app.get('/api/images', (req, res) => {
    if (!currentImageDirectory) {
        return res.status(400).json({ error: 'Image directory not set. Please select a directory first.' });
    }

    fs.readdir(currentImageDirectory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).json({ error: 'Failed to read image directory' });
        }
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.gif', '.bmp'].includes(ext);
        });
        res.json(imageFiles);
    });
});

// API to serve an image file
app.get('/api/image/:filename', (req, res) => {
    console.log('\n--- Image Request Received ---');
    if (!currentImageDirectory) {
        console.error('Error: Image directory not set.');
        return res.status(400).json({ error: 'Image directory not set.' });
    }
    console.log(`Current Image Directory: ${currentImageDirectory}`);

    const filename = req.params.filename;
    console.log(`Requested Filename: ${filename}`);

    const imagePath = path.join(currentImageDirectory, filename);
    console.log(`Computed Image Path: ${imagePath}`);

    if (fs.existsSync(imagePath) && fs.statSync(imagePath).isFile()) {
        console.log('Success: Image found. Sending file...');
        res.sendFile(imagePath);
    } else {
        console.error('Error: Image not found at computed path.');
        res.status(404).json({ error: `Image not found at path: ${imagePath}` });
    }
    console.log('--- End Image Request ---');
});

// API to get label data for an image
app.get('/api/label/:filename', (req, res) => {
    if (!currentImageDirectory) {
        return res.status(400).json({ error: 'Image directory not set.' });
    }
    const filename = req.params.filename;
    const labelFilename = path.parse(filename).name + '.txt'; // Assuming label file has same name as image but with .txt
    const labelPath = path.join(currentImageDirectory, labelFilename);

    if (fs.existsSync(labelPath) && fs.statSync(labelPath).isFile()) {
        fs.readFile(labelPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading label file:', err);
                return res.status(500).json({ error: 'Failed to read label file' });
            }
            res.send(data); // Send raw text content
        });
    } else {
        // If label file doesn't exist, return empty
        res.status(200).send('');
    }
});

// API to save label data for an image
app.post('/api/label/:filename', (req, res) => {
    if (!currentImageDirectory) {
        return res.status(400).json({ error: 'Image directory not set.' });
    }
    const filename = req.params.filename;
    const labelFilename = path.parse(filename).name + '.txt';
    const labelPath = path.join(currentImageDirectory, labelFilename);
    const labelData = req.body.data; // Expecting raw text data or stringified JSON

    if (typeof labelData !== 'string') {
        return res.status(400).json({ error: 'Label data must be a string' });
    }

    fs.writeFile(labelPath, labelData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing label file:', err);
            return res.status(500).json({ error: 'Failed to write label file' });
        }
        res.json({ message: `Label for ${filename} saved successfully.` });
    });
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
