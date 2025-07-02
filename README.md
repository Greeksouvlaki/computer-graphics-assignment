# Computer Graphics Project - WebGL Robot Scene

This project implements an interactive 3D WebGL scene for a Computer Graphics course assignment. The scene features a textured robot, a skybox, a floor with custom text, and a full set of interactive camera and animation controls.

## Features

- **3D Robot Model**: Built from cubes, with metal textures and a custom head texture.
- **Skybox**: Immersive environment using a 6-sided cubemap (stormy sky).
- **Textured Floor**: Floor features a custom-generated texture with project title and team member names/IDs.
- **Camera Controls**: UI for view angle, camera distance, and 8 preset camera positions.
- **Camera Animation**: Start/stop smooth camera orbit animation around the robot.
- **Mouse Camera Control**: Click and drag on the canvas to rotate the camera and change its height.
- **Robot Part Selection**: UI radio buttons to select a robot part (arms, legs, head) for manipulation.
- **Mouse Wheel Robot Control**: (UI present, but currently robot parts are static; rotation logic is ready for future implementation.)
- **Real-time Rendering**: All UI changes and controls update the scene immediately.
- **WebGL Debugging**: Uses webgl-debug.js for error reporting.

## Project Structure

- `index.html` - Main HTML file with the WebGL canvas and interactive controls
- `main.js` - WebGL implementation with shaders, rendering, textures, and UI logic
- `webgl-debug.js` - WebGL debugging utilities
- `gl-matrix-min.js` - Minimal glMatrix library for matrix operations
- `textures/` - Contains all required texture images
- `README.md` - This file

## Interactive Controls

- **View Angle**: Set the camera's field of view (1-179°)
- **Camera Distance**: Set the camera's distance from the scene (1-50 units)
- **Camera Position**: Choose from 8 preset camera positions (combinations of left/right, front/back, top/bottom)
- **Redraw Scene**: Button to update the scene with current settings
- **Start/Stop Animation**: Buttons to start/stop a smooth camera orbit
- **Mouse Drag**: Click and drag on the canvas to rotate the camera and change its height
- **Robot Part Selection**: Radio buttons to select a robot part (right arm, left arm, head, right leg, left leg)
- **Mouse Wheel (UI only)**: Intended to control robot part rotation (currently static, ready for future implementation)

## Visual & Technical Details

- **Robot**: Metal-textured body, custom head texture, correct proportions and placement
- **Skybox**: 6-sided cubemap for immersive background
- **Floor**: Custom-generated texture with project and team info ("Dimitrios Skoufis 21390317", "Dimitrios Lykoskoufis 21390320")
- **Shaders**: Separate programs for objects and skybox
- **Depth Testing**: Ensures correct 3D rendering order
- **Event Handling**: All UI and mouse events update the scene in real time
- **Coordinate System**: Right-handed, z-axis up

## How to Use

1. **Prepare Textures**: Place `metal.png`, `head.png`, and the six `stormy_*.png` skybox images in the `textures/` directory.
2. **Open in Firefox**: Open `index.html` in Mozilla Firefox for best WebGL compatibility.
3. **Use Controls**: Adjust camera, animation, and robot part selection using the UI and mouse.
4. **See Updates**: All changes are reflected in real time in the 3D scene.

## Current Limitations

- **Robot Part Animation**: The UI for selecting and rotating robot parts is present, but the actual rotation/animation logic is not currently active. The robot remains in its default pose.
- **Mouse Wheel**: Intended for robot part control, but currently does not animate the robot.

## Libraries Used

- `webgl-debug.js` - For WebGL debugging messages
- `gl-matrix-min.js` - For matrix operations (create, perspective, lookAt)

All libraries are included locally as required by the project specifications.

## Authors

- Dimitrios Skoufis 21390317
- Dimitrios Lykoskoufis 21390320 