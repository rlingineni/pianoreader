# Piano Reader

A web-based tool that automatically detects notes and chords from piano tutorial videos using computer vision. No server required - everything runs in your browser!

[Full Blog Post](https://heyraviteja.com/post/portfolio/piano-reader/)

## What is Piano Reader?

Piano Reader analyzes piano tutorial videos (like those made with Synthesia) and extracts the notes and chords being played in real-time. Instead of trying to follow falling raindrops and light-up keys, you get a clear tablature showing exactly what's being played.

### Output: Piano Tablature

|Left Hand | Right Hand |
| -------- | -------- |
| A Major  | A1 D     |
| A Maj    | A2       |
| D minor  | D2       |


## Features

- 🎥 **Browser-based video processing** - No server required
- 🎹 **Automatic key detection** - Set two reference points, generate the rest
- 🎵 **Real-time note tracking** - Detects which keys are pressed each frame
- 🎶 **Chord recognition** - Uses Tonal.js to identify chords from detected notes
- ⚙️ **Adjustable sensitivity** - Fine-tune detection for different video types
- 📱 **Mobile responsive** - Works on desktop and mobile devices

## Limitations

- **White keys only**: Currently doesn't support black keys/sharps
- **Real-time processing**: Must play video at normal speed for accurate detection
- **Local files only**: Cannot process videos from URLs due to CORS restrictions
- **Manual calibration**: Requires user to position initial tracking points

## How It Works

1. **Load a video file** - Upload your piano tutorial video
2. **Position tracking points** - Drag the red and blue markers to align with C1 and D1 keys
3. **Generate piano overlay** - The tool creates tracking rectangles for all white keys
4. **Analyze frames** - Each video frame is processed to detect lit-up keys
5. **Extract notes & chords** - Real-time output of notes and chord progressions

## Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Piano tutorial video file (MP4, WebM, etc.)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pianoreader.git
cd pianoreader
```

2. Install dependencies:
```bash
cd react-src
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser to `http://localhost:3000`

### Desktop support
I intially started to build the app as a desktop app with [`neutralino.js`](https://neutralino.js.org/). This is no longer used, but you can build on it as a desktop app with:

```
npm install -g @neutralinojs/neu
neu run
```

### Usage

1. **Upload Video**: Click "Choose File" and select your piano tutorial video
2. **Position Markers**: 
   - Drag the red marker to the C1 key
   - Drag the blue marker to the D1 key
3. **Generate Tracking**: Click "Generate Piano Keys" to create the overlay
4. **Adjust Settings**:
   - **Key Distance**: Fine-tune spacing between keys
   - **Tracker Height**: Adjust vertical position of detection area
   - **Sensitivity**: Control how sensitive the detection is
5. **Play & Analyze**: Start the video to see real-time note detection

## Technical Details

### Architecture

- **Frontend**: React.js with Fabric.js for interactive canvas
- **Video Processing**: HTML5 Canvas with `getImageData()` for pixel analysis
- **Computer Vision**: Grayscale filtering + threshold-based key detection
- **Music Theory**: Tonal.js for chord recognition
- **Styling**: Tailwind CSS

### Key Components

```
src/
├── canvas.js          # Main video processing and key detection
├── utils.js           # Grayscale analysis and helper functions
├── components/
│   ├── playercontrols.js    # Video playback controls
│   └── notesviewer.js       # note/chord display
└── App.js            # Main application component
```

### Detection Algorithm

1. **Grayscale Conversion**: Apply grayscale filter to reduce color complexity
2. **Pixel Sampling**: Extract pixel data from each key's detection area
3. **Threshold Analysis**: Compare average grayscale value against sensitivity threshold
4. **Key State**: Determine if key is "pressed" (lit up) or "unpressed"
5. **Chord Detection**: Pass detected notes to Tonal.js for chord identification

## Configuration

### URL Parameters

You can bookmark specific configurations using URL parameters:

```
?c1=170,400&d1=183,400&kd=0&h=400&s=0.33&t=5
```

- `c1`: C1 key position (left,top)
- `d1`: D1 key position (left,top) 
- `kd`: Key distance adjustment
- `h`: Tracker height
- `s`: Sensitivity (0-1)
- `t`: Start time in seconds

### Sensitivity Tuning

- **Low sensitivity (0.1-0.3)**: Only very bright keys detected
- **Medium sensitivity (0.3-0.6)**: Balanced detection
- **High sensitivity (0.6-1.0)**: Detects dimmer key presses


## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Future
I don't have major plans to do much with this tool at the moment, happy to take contributions or encourage a fork.

