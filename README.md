# Computer Graphics Project - WebGL Cube

This project implements a 3D WebGL scene with a colored cube as specified in the Computer Graphics course requirements.

## Project Structure

- `index.html` - Main HTML file with the WebGL canvas and interactive controls
- `main.js` - WebGL implementation with shaders and rendering logic
- `webgl-debug.js` - WebGL debugging utilities
- `gl-matrix-min.js` - Minimal glMatrix library for matrix operations
- `README.md` - This file

## Requirements Implemented

### Step 1 (5%) - Colored Cube
- ✅ Cube with edge length 1 centered at (0,0,0)
- ✅ Each face has a different solid color:
  - Front face: Red
  - Back face: Green
  - Top face: Blue
  - Bottom face: Yellow
  - Right face: Magenta
  - Left face: Cyan
- ✅ Dark gray background color
- ✅ Different vertices for each face to allow different colors

### Step 2 (5%) - Camera Setup
- ✅ Camera positioned at (8,8,8)
- ✅ Camera looking at the center of the scene (0,0,0)
- ✅ Camera oriented with up vector (0,0,1) - aligned with z-axis
- ✅ 60° field of view
- ✅ Aspect ratio 1 (square viewport)
- ✅ Near clipping plane: 0.001
- ✅ Far clipping plane: 8000

### Step 3 (5%) - Interactive Camera Controls
- ✅ **View Angle Text Box**: Input field for field of view angle in degrees
- ✅ **Camera Distance Text Box**: Input field for orthogonal camera distance
- ✅ **Radio Button Group**: 8 predefined camera positions:
  - Left-Front-Top: (-camOrthoDistance, -camOrthoDistance, camOrthoDistance)
  - Left-Front-Bottom: (-camOrthoDistance, -camOrthoDistance, -camOrthoDistance)
  - Left-Back-Top: (-camOrthoDistance, camOrthoDistance, camOrthoDistance)
  - Left-Back-Bottom: (-camOrthoDistance, camOrthoDistance, -camOrthoDistance)
  - Right-Front-Top: (camOrthoDistance, -camOrthoDistance, camOrthoDistance)
  - Right-Front-Bottom: (camOrthoDistance, -camOrthoDistance, -camOrthoDistance)
  - Right-Back-Top: (camOrthoDistance, camOrthoDistance, camOrthoDistance)
  - Right-Back-Bottom: (camOrthoDistance, camOrthoDistance, -camOrthoDistance)

### Step 4 (5%) - Redraw Functionality
- ✅ **Redraw Button**: Updates the scene based on current control values
- ✅ **Dynamic Far Clipping Plane**: Uses a multiple of camera distance as far clipping plane
- ✅ **Real-time Updates**: Scene updates automatically when controls change
- ✅ **Camera Position Mapping**: Converts radio button selections to 3D coordinates

### Step 5 (15%) - Robot Model
- ✅ **Robot Drawing**: A robot figure is drawn using transformed cubes.
- ✅ **Correct Positioning**: The robot is positioned on the xy-plane with its base at z=0.
- ✅ **Color Scheme**:
  - Torso & Feet: Shades of red.
  - Head, Arms, & Legs: Shades of yellow.
- ✅ **Transformation-based**: Built by applying `scale` and `translate` to a single cube mesh.

### Step 6 (5%) - Camera Animation
- ✅ **Circular Animation**: The camera performs a smooth, circular orbit around the robot at a constant height.
- ✅ **Start/Stop Buttons**: Buttons to play and pause the animation.
- ✅ **Dynamic Radius**: The animation uses the user-provided `camOrthoDistance` as the rotation radius.

### Step 7 (10%) - Object Texturing
- ✅ **Robot Texturing**: The robot's body parts are now textured with a metal image instead of flat colors.
- ✅ **Custom Head Texture**: The robot's head uses a special texture atlas (`head.png`) to map different features (face, ears) to the correct sides of the cube.
- ✅ **Texture Coordinates**: A new buffer with texture coordinates (`UVs`) has been created and is used for mapping.

### Step 8 (10%) - Environment Texturing
- ✅ **Skybox**: The scene is now enclosed in a skybox, a large cube with a seamless, stormy sky texture mapped onto its interior faces, creating an immersive environment.
- ✅ **Textured Floor**: A 60x60 floor plane has been added, featuring a dynamically generated texture with a professional dark gradient background, subtle grid pattern, decorative elements, and elegant text displaying the project information and team member names.
- ✅ **Cubemap and 2D Textures**: The implementation correctly loads and handles both standard 2D textures and cubemap textures for the skybox.
- ✅ **Visual Improvements**: Enhanced skybox rendering with proper screen-space coordinates and improved floor texture design for a more professional appearance.

### Step 9 (10%) - Mouse-Controlled Camera Animation
- ✅ **Mouse Drag Control**: Click and drag on the canvas to control camera movement.
- ✅ **Horizontal Movement**: Left-right mouse movement controls camera rotation around the scene.
- ✅ **Vertical Movement**: Up-down mouse movement controls camera height (clamped between 5-30 units).
- ✅ **Real-time Updates**: Camera position updates immediately during mouse drag operations.
- ✅ **Visual Feedback**: Cursor changes to "grabbing" during mouse drag operations.

### Step 10 (10%) - Mouse Wheel Robot Part Control
- ✅ **Robot Part Selection**: Radio buttons to select which robot part to control:
  - Right Arm (180° rotation: down to up)
  - Left Arm (180° rotation: down to up)
  - Head (90° rotation: straight to down)
  - Right Leg (90° rotation: down to forward)
  - Left Leg (90° rotation: down to forward)
- ✅ **Mouse Wheel Control**: Scroll wheel controls the selected robot part's rotation.
- ✅ **Rotation Limits**: Each part has appropriate rotation limits as specified in the requirements.
- ✅ **Real-time Animation**: Robot parts animate smoothly during wheel scrolling.
- ✅ **Independent Operation**: Works whether camera animation is running or stopped.

## How to Use

1. **Prepare Textures**: Ensure all required texture files (`metal.png`, `head.png`, and the six `stormy_*.png` skybox images) are present in the `textures/` directory.
2. Open `index.html` in Mozilla Firefox (recommended for best WebGL compatibility)
3. The scene displays a colored cube with interactive controls on the left
4. **Adjust View Angle**: Change the field of view (1-179 degrees)
5. **Adjust Camera Distance**: Change how far the camera is from the origin
6. **Select Camera Position**: Choose from 8 predefined viewing angles
7. **Click "Redraw Scene"**: Updates the view with current settings
8. **Start/Stop Animation**: Use the animation buttons to see a spiral camera tour around the robot

## Interactive Controls

### View Angle
- **Range**: 1-179 degrees
- **Default**: 60 degrees
- **Effect**: Changes the field of view (perspective)

### Camera Distance
- **Range**: 1-50 units
- **Default**: 8 units
- **Effect**: Controls how far the camera is from the origin

### Camera Position
- **8 Options**: All combinations of Left/Right, Front/Back, Top/Bottom
- **Coordinates**: Based on camera distance value
- **Effect**: Changes the viewing angle of the cube

### Animation
- **Start**: Begins a smooth, circular camera animation around the scene.
- **Stop**: Pauses the animation.

## Technical Details

- **WebGL Version**: WebGL 1.0
- **Matrix Library**: glMatrix 2.0 (minimal version)
- **Shaders**: The project now uses two separate shader programs: one for standard textured objects (robot, floor) and another specifically designed for rendering the skybox cubemap.
- **Rendering**: The rendering pipeline is now more advanced. It draws the skybox first (with depth testing configured to ensure it's always in the background), followed by the textured floor and the robot.
- **Texture Management**: Includes utility functions for loading 2D textures and 6-sided cubemaps asynchronously. It also features a function to dynamically generate a texture from a 2D canvas for the floor.
- **Depth Testing**: Enabled for proper 3D rendering
- **Event Handling**: Real-time updates and button-triggered redraws
- **Coordinate System**: Right-handed with z-axis as up vector

## Browser Compatibility

This project is designed to work with Mozilla Firefox as specified in the requirements. Firefox provides native WebGL support and is available in the physical laboratory environment.

## Libraries Used

- `webgl-debug.js` - For WebGL debugging messages
- `gl-matrix-min.js` - For matrix operations (create, perspective, lookAt)

All libraries are included locally as required by the project specifications. 

- ✅ **UI Lock**: Disables camera controls during animation to prevent conflicts. 