// WebGL Computer Graphics Project
// Steps 7 & 8: Texturing, Skybox, and Textured Floor

console.log("main.js loaded successfully!");

let gl;
let objectProgramInfo, skyboxProgramInfo;
let buffers = {};
let textures = {};
let animationFrameId = null;
let angle = 0;

// Mouse control variables (Step 9)
let isMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;
let mouseCameraAngle = 0;
let mouseCameraHeight = 15;

// Robot part rotation variables (Step 10)
let robotRotations = {
    rightArm: 0,    // 0 = down, Math.PI = up (180 degrees)
    leftArm: 0,     // 0 = down, Math.PI = up (180 degrees)
    head: 0,        // 0 = straight, Math.PI/2 = down (90 degrees)
    rightLeg: 0,    // 0 = down, Math.PI/2 = forward (90 degrees)
    leftLeg: 0      // 0 = down, Math.PI/2 = forward (90 degrees)
};

// --- Main Shader for Robot and Floor ---
const vsSource = `
    attribute vec4 aPosition;
    attribute vec2 aTexCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTexCoord;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
        vTexCoord = aTexCoord;
    }
`;

const fsSource = `
    precision mediump float;
    varying highp vec2 vTexCoord;
    uniform sampler2D uSampler;
    uniform vec4 uTintColor;

    void main() {
        gl_FragColor = texture2D(uSampler, vTexCoord) * uTintColor;
    }
`;

// --- Skybox Shader ---
const skyboxVsSource = `
    attribute vec4 aPosition;
    varying vec4 vPosition;
    void main() {
        vPosition = aPosition;
        gl_Position = aPosition;
        gl_Position.z = 1.0;
    }
`;

const skyboxFsSource = `
    precision mediump float;
    uniform samplerCube uSkybox;
    uniform mat4 uViewDirectionProjectionInverse;
    varying vec4 vPosition;
    void main() {
      vec4 t = uViewDirectionProjectionInverse * vPosition;
      gl_FragColor = textureCube(uSkybox, normalize(t.xyz / t.w));
    }
`;

function main() {
    console.log("Starting WebGL initialization...");
    
    const canvas = document.querySelector("#glCanvas");
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    
    // Ensure canvas has proper dimensions before WebGL context creation
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log("Canvas size set to:", canvas.width, "x", canvas.height);
    
    // Test WebGL support
    console.log("Testing WebGL support...");
    const testCanvas = document.createElement('canvas');
    const testGL = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (testGL) {
        console.log("WebGL is supported in this browser");
        console.log("WebGL version:", testGL.getParameter(testGL.VERSION));
        console.log("WebGL vendor:", testGL.getParameter(testGL.VENDOR));
        console.log("WebGL renderer:", testGL.getParameter(testGL.RENDERER));
    } else {
        console.error("WebGL is NOT supported in this browser");
    }
    
    // Attempting to create WebGL context on canvas
    console.log("Attempting to create WebGL context on canvas:", canvas);
    console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
    console.log("Canvas style dimensions:", canvas.style.width, "x", canvas.style.height);
    
    gl = canvas.getContext("webgl");
    console.log("WebGL context result:", gl);
    
    // Fallback to experimental WebGL if still no success
    if (!gl) {
        console.log("Trying experimental WebGL context...");
        gl = canvas.getContext("experimental-webgl");
        console.log("Experimental WebGL context result:", gl);
    }
    
    if (!gl) {
        console.error("Unable to initialize WebGL. Your browser may not support it.");
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }
    
    console.log("WebGL context created successfully");
    
    // Force WebGL context activation
    gl.getError(); // Clear any existing errors
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    // Set a clear color and clear the buffer to activate the context
    gl.clearColor(0.1, 0.1, 0.2, 1.0); // Dark blue-grey background
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Add resize listener
    window.addEventListener('resize', () => {
        resizeCanvas();
        render(); 
    });
    
    // Add focus listener to ensure context is active
    window.addEventListener('focus', () => {
        if (gl) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            render();
        }
    });
    
    // Add canvas click handler to force WebGL activation
    canvas.addEventListener('click', () => {
        console.log("Canvas clicked - forcing WebGL activation");
        if (gl) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            render();
        }
    });
    
    // Add a simple test render to force context activation
    setTimeout(() => {
        if (gl) {
            console.log("Forcing initial WebGL activation...");
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(1.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
    }, 50);
    
    // --- Initialize Shaders ---
    console.log("Initializing shaders...");
    const objectShaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const skyboxShaderProgram = initShaderProgram(gl, skyboxVsSource, skyboxFsSource);

    if (!objectShaderProgram || !skyboxShaderProgram) {
        console.error("Failed to initialize shaders!");
        alert("Failed to initialize shaders!");
        return;
    }
    
    console.log("Shaders initialized successfully");

    objectProgramInfo = {
        program: objectShaderProgram,
        attribLocations: {
            position: gl.getAttribLocation(objectShaderProgram, 'aPosition'),
            texCoord: gl.getAttribLocation(objectShaderProgram, 'aTexCoord'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(objectShaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(objectShaderProgram, 'uModelViewMatrix'),
            sampler: gl.getUniformLocation(objectShaderProgram, 'uSampler'),
            tintColor: gl.getUniformLocation(objectShaderProgram, 'uTintColor'),
        },
    };

    skyboxProgramInfo = {
        program: skyboxShaderProgram,
        attribLocations: {
            position: gl.getAttribLocation(skyboxShaderProgram, "aPosition"),
        },
        uniformLocations: {
            skybox: gl.getUniformLocation(skyboxShaderProgram, "uSkybox"),
            viewDirectionProjectionInverse: gl.getUniformLocation(skyboxShaderProgram, "uViewDirectionProjectionInverse"),
        },
    };
    
    console.log("Program info created");

    console.log("Initializing buffers...");
    initBuffers();
    
    console.log("Loading textures...");
    loadAllTextures(() => {
        console.log("All textures loaded, setting up event listeners...");
        setupEventListeners();
        console.log("Event listeners set up, performing initial render...");
        // Force an initial render after everything is loaded
        setTimeout(() => {
            console.log("Performing initial render...");
            render();
            console.log("Initial render complete");
        }, 100);
    });
    
    // Fallback: set up event listeners after a delay even if texture loading fails
    setTimeout(() => {
        console.log("Fallback: setting up event listeners...");
        setupEventListeners();
    }, 2000);
}

function loadAllTextures(callback) {
    console.log("Starting texture loading...");
    let loadedCount = 0;
    const numTextures = 8; // metal, head, floor, and 6 skybox faces

    const onTextureLoaded = () => {
        loadedCount++;
        console.log("Texture loaded, count:", loadedCount, "/", numTextures);
        if (loadedCount === numTextures) {
            console.log("All textures loaded, calling callback...");
            callback();
        }
    };

    console.log("Loading metal texture...");
    textures.metal = loadTexture('textures/metal.png', onTextureLoaded);
    
    console.log("Loading head texture...");
    textures.head = loadTexture('textures/head.png', onTextureLoaded);
    
    console.log("Creating floor texture...");
    textures.floor = createFloorTexture(); // This is synchronous but we'll count it
    onTextureLoaded(); 

    console.log("Loading skybox textures...");
    textures.skybox = loadCubeMap([
        'textures/stormy_bk.png', 'textures/stormy_ft.png',  // Right, Left (swapped back/front)
        'textures/stormy_up.png', 'textures/stormy_dn.png',  // Up, Down (unchanged)
        'textures/stormy_lf.png', 'textures/stormy_rt.png'   // Back, Front (swapped left/right)
    ], onTextureLoaded);
    
    // Fallback: if textures don't load within 5 seconds, set up event listeners anyway
    setTimeout(() => {
        if (loadedCount < numTextures) {
            console.log("Texture loading timeout, setting up event listeners anyway...");
            callback();
        }
    }, 5000);
}

function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    const redrawBtn = document.getElementById('redrawBtn');
    const viewAngleInput = document.getElementById('viewAngle');
    const camDistanceInput = document.getElementById('camOrthoDistance');
    const startAnimBtn = document.getElementById('startAnimationBtn');
    const stopAnimBtn = document.getElementById('stopAnimationBtn');
    
    if (redrawBtn) {
        redrawBtn.addEventListener('click', () => {
            console.log("Redraw button clicked");
            render();
        });
        console.log("Redraw button listener added");
        
        // Test the button immediately
        console.log("Testing redraw button functionality...");
        setTimeout(() => {
            console.log("Simulating redraw button click...");
            redrawBtn.click();
        }, 1000);
    } else {
        console.error("Redraw button not found!");
    }
    
    if (viewAngleInput) {
        viewAngleInput.addEventListener('input', () => {
            console.log("View angle changed to:", viewAngleInput.value);
            render();
        });
        console.log("View angle listener added");
    } else {
        console.error("View angle input not found!");
    }
    
    if (camDistanceInput) {
        camDistanceInput.addEventListener('input', () => {
            console.log("Camera distance changed to:", camDistanceInput.value);
            render();
        });
        console.log("Camera distance listener added");
    } else {
        console.error("Camera distance input not found!");
    }
    
    const radioButtons = document.querySelectorAll('input[name="cameraPos"]');
    radioButtons.forEach((radio, index) => {
        radio.addEventListener('change', () => {
            console.log("Camera position changed to:", radio.value);
            render();
        });
    });
    console.log("Camera position listeners added for", radioButtons.length, "buttons");
    
    if (startAnimBtn) {
        startAnimBtn.addEventListener('click', () => {
            console.log("Start animation button clicked");
            startAnimation();
        });
        console.log("Start animation listener added");
    } else {
        console.error("Start animation button not found!");
    }
    
    if (stopAnimBtn) {
        stopAnimBtn.addEventListener('click', () => {
            console.log("Stop animation button clicked");
            stopAnimation();
        });
        console.log("Stop animation listener added");
    } else {
        console.error("Stop animation button not found!");
    }
    
    console.log("All event listeners set up");
    
    // Mouse control event listeners (Step 9)
    const canvas = document.getElementById('glCanvas');
    if (canvas) {
        // Mouse down
        canvas.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            canvas.style.cursor = 'grabbing';
        });
        
        // Mouse up
        canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
            canvas.style.cursor = 'pointer';
        });
        
        // Mouse move
        canvas.addEventListener('mousemove', (event) => {
            if (isMouseDown) {
                const deltaX = event.clientX - lastMouseX;
                const deltaY = event.clientY - lastMouseY;
                
                // Camera rotation (left-right movement)
                mouseCameraAngle += deltaX * 0.01;
                
                // Camera height (up-down movement)
                mouseCameraHeight += deltaY * 0.1;
                mouseCameraHeight = Math.max(5, Math.min(30, mouseCameraHeight)); // Clamp between 5 and 30
                
                lastMouseX = event.clientX;
                lastMouseY = event.clientY;
                
                // Update camera position and render
                const radius = parseFloat(document.getElementById('camOrthoDistance').value);
                const camX = radius * Math.cos(mouseCameraAngle);
                const camY = radius * Math.sin(mouseCameraAngle);
                render([camX, camY, mouseCameraHeight]);
            }
        });
        
        // Mouse wheel for robot part control (Step 10)
        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            const selectedPart = document.querySelector('input[name="robotPart"]:checked').value;
            const delta = event.deltaY * 0.01; // Sensitivity
            
            console.log('Mouse wheel:', selectedPart, 'delta:', delta);
            
            switch (selectedPart) {
                case 'right-arm':
                    robotRotations.rightArm += delta;
                    // Clamp between -90° and 170° in radians
                    robotRotations.rightArm = Math.max(-Math.PI / 2, Math.min(robotRotations.rightArm, 2.97));
                    console.log('Right arm rotation:', robotRotations.rightArm);
                    break;
                case 'left-arm':
                    robotRotations.leftArm += delta;
                    // Clamp between -90° and 170° in radians
                    robotRotations.leftArm = Math.max(-Math.PI / 2, Math.min(robotRotations.leftArm, 2.97));
                    console.log('Left arm rotation:', robotRotations.leftArm);
                    break;
                case 'head':
                    robotRotations.head += delta;
                    robotRotations.head = Math.max(-Math.PI/4, Math.min(0, robotRotations.head)); // 90° range, straight to down
                    console.log('Head rotation:', robotRotations.head);
                    break;
                case 'right-leg':
                    robotRotations.rightLeg += delta;
                    robotRotations.rightLeg = Math.max(-Math.PI/4, Math.min(0, robotRotations.rightLeg)); // 90° range, down to forward
                    console.log('Right leg rotation:', robotRotations.rightLeg);
                    break;
                case 'left-leg':
                    robotRotations.leftLeg += delta;
                    robotRotations.leftLeg = Math.max(-Math.PI/4, Math.min(0, robotRotations.leftLeg)); // 90° range, down to forward
                    console.log('Left leg rotation:', robotRotations.leftLeg);
                    break;
            }
            
            render(); // Re-render with updated robot rotations
        });
        
        console.log("Mouse control event listeners added");
    }
    
    // Test that render function is accessible
    console.log("Testing render function accessibility...");
    if (typeof render === 'function') {
        console.log("Render function is accessible");
    } else {
        console.error("Render function is NOT accessible!");
    }
}

function getCameraPosition() {
    const camOrthoDistance = parseFloat(document.getElementById('camOrthoDistance').value);
    const selectedPosition = document.querySelector('input[name="cameraPos"]:checked').value;
    
    const positionMap = {
        'left-front-top': [-camOrthoDistance, -camOrthoDistance, camOrthoDistance],
        'left-front-bottom': [-camOrthoDistance, -camOrthoDistance, -camOrthoDistance],
        'left-back-top': [-camOrthoDistance, camOrthoDistance, camOrthoDistance],
        'left-back-bottom': [-camOrthoDistance, camOrthoDistance, -camOrthoDistance],
        'right-front-top': [camOrthoDistance, -camOrthoDistance, camOrthoDistance],
        'right-front-bottom': [camOrthoDistance, -camOrthoDistance, -camOrthoDistance],
        'right-back-top': [camOrthoDistance, camOrthoDistance, camOrthoDistance],
        'right-back-bottom': [camOrthoDistance, camOrthoDistance, -camOrthoDistance]
    };
    
    return positionMap[selectedPosition];
}

function resizeCanvas() {
    const canvas = gl.canvas;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    // Check if the canvas is not the same size
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}

function initBuffers() {
    // --- Robot/Floor Cube Buffers ---
    const positions = [
        // Front face
        -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,
        // Back face
        -0.5, -0.5, -0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,
        // Top face
        -0.5,  0.5, -0.5,  -0.5,  0.5,  0.5,   0.5,  0.5,  0.5,   0.5,  0.5, -0.5,
        // Bottom face
        -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5,  0.5,  -0.5, -0.5,  0.5,
        // Right face
         0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5,  0.5,  0.5,   0.5, -0.5,  0.5,
        // Left face
        -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5,
    ];
    const indices = [
        0,  1,  2,    0,  2,  3,    // front
        4,  5,  6,    4,  6,  7,    // back
        8,  9, 10,    8, 10, 11,   // top
        12, 13, 14,   12, 14, 15,  // bottom
        16, 17, 18,   16, 18, 19,  // right
        20, 21, 22,   20, 22, 23,  // left
    ];
    
    buffers.position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    buffers.indices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // --- Texture Coordinates ---
    // Standard UVs for a cube
    const texCoords = [
      // Front
      0.0,  0.0,  1.0,  0.0,  1.0,  1.0,  0.0,  1.0,
      // Back
      0.0,  0.0,  1.0,  0.0,  1.0,  1.0,  0.0,  1.0,
      // Top
      0.0,  0.0,  1.0,  0.0,  1.0,  1.0,  0.0,  1.0,
      // Bottom
      0.0,  0.0,  1.0,  0.0,  1.0,  1.0,  0.0,  1.0,
      // Right
      0.0,  0.0,  1.0,  0.0,  1.0,  1.0,  0.0,  1.0,
      // Left
      0.0,  0.0,  1.0,  0.0,  1.0,  1.0,  0.0,  1.0,
    ];
    buffers.texCoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    // Specific UVs for the robot head atlas
    const headTexCoords = [
        // Front (Face) - mirrored
        0.0, 1.0,  0.5, 1.0,  0.5, 0.5,  0.0, 0.5,
        // Back - mirrored
        1.0, 0.5,  0.5, 0.5,  0.5, 0.0,  1.0, 0.0,
        // Top
        0.0, 0.0,   0.5, 0.0,   0.5, 0.5,   0.0, 0.5,
        // Bottom
        0.5, 0.5,   1.0, 0.5,   1.0, 1.0,   0.5, 1.0,
        // Right (Ear)
        0.5, 0.0,   1.0, 0.0,   1.0, 0.5,   0.5, 0.5,
        // Left (Ear)
        0.0, 0.0,   0.5, 0.0,   0.5, 0.5,   0.0, 0.5,
    ].flat();
    buffers.headTexCoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.headTexCoord);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(headTexCoords), gl.STATIC_DRAW);

    // Specific UVs for the floor (flipped to fix mirroring)
    const floorTexCoords = [
        // Front face (flipped horizontally)
        1.0, 0.0,   0.0, 0.0,   0.0, 1.0,   1.0, 1.0,
        // Back face (flipped horizontally)
        1.0, 0.0,   0.0, 0.0,   0.0, 1.0,   1.0, 1.0,
        // Top face (flipped both directions)
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,
        // Bottom face (flipped both directions)
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,
        // Right face (flipped vertically)
        0.0, 1.0,   1.0, 1.0,   1.0, 0.0,   0.0, 0.0,
        // Left face (flipped vertically)
        0.0, 1.0,   1.0, 1.0,   1.0, 0.0,   0.0, 0.0,
    ];
    buffers.floorTexCoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.floorTexCoord);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorTexCoords), gl.STATIC_DRAW);

    // --- Skybox Buffers ---
    // Screen-space quad for skybox (covers entire screen)
    const skyboxPositions = [
        -1, -1,  // bottom-left
         1, -1,  // bottom-right
         1,  1,  // top-right
        -1,  1,  // top-left
    ];
    buffers.skybox = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.skybox);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skyboxPositions), gl.STATIC_DRAW);
}


function render(cameraPositionOverride) {
    console.log("Render function called");
    
    // Ensure WebGL context is still valid
    if (!gl) {
        console.error("WebGL context lost");
        return;
    }
    
    // Resize canvas if needed
    resizeCanvas();
    
    gl.clearColor(0.1, 0.1, 0.2, 1.0); // Dark blue-grey background
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    const viewAngle = parseFloat(document.getElementById('viewAngle').value);
    const camOrthoDistance = parseFloat(document.getElementById('camOrthoDistance').value);
    const cameraPosition = cameraPositionOverride || getCameraPosition();
    
    console.log("Rendering with:", {
        viewAngle: viewAngle + "°",
        camOrthoDistance: camOrthoDistance + " units",
        cameraPosition: cameraPosition,
        canvasSize: [gl.canvas.width, gl.canvas.height],
        aspectRatio: gl.canvas.clientWidth / gl.canvas.clientHeight
    });
    
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, viewAngle * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 2000.0);
    
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, cameraPosition, [0, 0, 10], [0, 0, 1]);

    try {
        console.log("Drawing skybox...");
        drawSkybox(projectionMatrix, viewMatrix);
        console.log("Drawing floor...");
        drawFloor(projectionMatrix, viewMatrix);
        console.log("Drawing robot...");
        drawRobot(projectionMatrix, viewMatrix);
        console.log("Render completed successfully");
    } catch (error) {
        console.error("Error during rendering:", error);
    }
}

function drawPart(projectionMatrix, viewMatrix, translate, scale, texture, texCoordBuffer = buffers.texCoord, tintColor = [1, 1, 1, 1]) {
    try {
        gl.useProgram(objectProgramInfo.program);

        // --- Bind buffers ---
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(objectProgramInfo.attribLocations.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(objectProgramInfo.attribLocations.position);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(objectProgramInfo.attribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(objectProgramInfo.attribLocations.texCoord);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        
        // --- Set matrices ---
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, translate);
        mat4.scale(modelMatrix, modelMatrix, scale);
        
        const modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
        
        gl.uniformMatrix4fv(objectProgramInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(objectProgramInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        
        // --- Set texture ---
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(objectProgramInfo.uniformLocations.sampler, 0);
        
        // --- Set tint color ---
        gl.uniform4fv(objectProgramInfo.uniformLocations.tintColor, tintColor);

        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    } catch (error) {
        console.error('Error in drawPart:', error);
    }
}

function drawPartWithPivot(projectionMatrix, viewMatrix, pivot, rotation, translate, scale, texture, texCoordBuffer = buffers.texCoord, tintColor = [1,1,1,1]) {
    gl.useProgram(objectProgramInfo.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(objectProgramInfo.attribLocations.position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(objectProgramInfo.attribLocations.position);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(objectProgramInfo.attribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(objectProgramInfo.attribLocations.texCoord);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    let modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, pivot);
    mat4.rotateX(modelMatrix, modelMatrix, rotation);
    mat4.translate(modelMatrix, modelMatrix, translate);
    mat4.scale(modelMatrix, modelMatrix, scale);
    let modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
    gl.uniformMatrix4fv(objectProgramInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(objectProgramInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(objectProgramInfo.uniformLocations.sampler, 0);
    gl.uniform4fv(objectProgramInfo.uniformLocations.tintColor, tintColor);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function drawRobot(projectionMatrix, viewMatrix) {
    const torsoColor = [0.8, 0.2, 0.2, 1.0];
    const feetColor = [0.6, 0.1, 0.1, 1.0];
    const limbsColor = [1.0, 0.8, 0.2, 1.0];
    // Feet
    drawPart(projectionMatrix, viewMatrix, [-3, 0, 1], [4, 6, 2], textures.metal, buffers.texCoord, feetColor);
    drawPart(projectionMatrix, viewMatrix, [3, 0, 1], [4, 6, 2], textures.metal, buffers.texCoord, feetColor);
    // Legs
    drawPart(projectionMatrix, viewMatrix, [-3, 0, 7], [4, 4, 10], textures.metal, buffers.texCoord, limbsColor);
    drawPart(projectionMatrix, viewMatrix, [3, 0, 7], [4, 4, 10], textures.metal, buffers.texCoord, limbsColor);
    // Torso
    drawPart(projectionMatrix, viewMatrix, [0, 0, 17], [10, 4, 10], textures.metal, buffers.texCoord, torsoColor);
    // Left arm (rotating around shoulder)
    drawPartWithPivot(projectionMatrix, viewMatrix, [-6.5, 0, 22], robotRotations.leftArm, [0, 0, -5], [3, 4, 10], textures.metal, buffers.texCoord, limbsColor);
    // Right arm (rotating around shoulder)
    drawPartWithPivot(projectionMatrix, viewMatrix, [6.5, 0, 22], robotRotations.rightArm, [0, 0, -5], [3, 4, 10], textures.metal, buffers.texCoord, limbsColor);
    // Head (rotated 180° around Z by flipping X and Y scale)
    drawPart(projectionMatrix, viewMatrix, [0, 0, 24.5], [-6, -4, 5], textures.head, buffers.headTexCoord);
}

function drawFloor(projectionMatrix, viewMatrix) {
    drawPart(projectionMatrix, viewMatrix, [0, 0, -0.05], [60, 60, 0.1], textures.floor, buffers.floorTexCoord);
}

function drawSkybox(projectionMatrix, viewMatrix) {
    gl.useProgram(skyboxProgramInfo.program);

    // Create a view matrix with no translation
    let viewDirectionMatrix = mat4.clone(viewMatrix);
    viewDirectionMatrix[12] = 0;
    viewDirectionMatrix[13] = 0;
    viewDirectionMatrix[14] = 0;
    
    let viewDirectionProjectionMatrix = mat4.create();
    mat4.multiply(viewDirectionProjectionMatrix, projectionMatrix, viewDirectionMatrix);
    let viewDirectionProjectionInverse = mat4.create();
    mat4.invert(viewDirectionProjectionInverse, viewDirectionProjectionMatrix);

    gl.uniformMatrix4fv(skyboxProgramInfo.uniformLocations.viewDirectionProjectionInverse, false, viewDirectionProjectionInverse);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, textures.skybox);
    gl.uniform1i(skyboxProgramInfo.uniformLocations.skybox, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.skybox);
    gl.vertexAttribPointer(skyboxProgramInfo.attribLocations.position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(skyboxProgramInfo.attribLocations.position);
    
    gl.depthFunc(gl.LEQUAL);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function startAnimation() {
    console.log("startAnimation called");
    if (animationFrameId) {
        console.log("Stopping existing animation");
        stopAnimation();
    }
    console.log("Disabling controls...");
    document.querySelectorAll('#controls input, #controls button:not(#stopAnimationBtn)').forEach(el => el.disabled = true);
    console.log("Starting tick...");
    tick();
}

function stopAnimation() {
    console.log("stopAnimation called");
    if (animationFrameId) {
        console.log("Cancelling animation frame:", animationFrameId);
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    console.log("Enabling controls...");
    document.querySelectorAll('#controls input, #controls button').forEach(el => el.disabled = false);
}

function tick() {
    console.log("tick called, angle:", angle);
    angle += 0.005;
    const radius = parseFloat(document.getElementById('camOrthoDistance').value);
    const camX = radius * Math.cos(angle);
    const camY = radius * Math.sin(angle);
    const camZ = 15;
    
    console.log("Rendering animation frame with camera:", [camX, camY, camZ]);
    render([camX, camY, camZ]);
    animationFrameId = requestAnimationFrame(tick);
}

// --- UTILITY FUNCTIONS ---

function initShaderProgram(gl, vsSource, fsSource) {
    const program = gl.createProgram();
    gl.attachShader(program, loadShader(gl, gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, loadShader(gl, gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const errorMsg = 'An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader);
        console.error(errorMsg);
        alert(errorMsg);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function loadTexture(url, callback) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255])); // blue pixel
    
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
           gl.generateMipmap(gl.TEXTURE_2D);
        } else {
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        if (callback) callback();
    };
    image.src = url;
    return texture;
}

function loadCubeMap(urls, callback) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faceInfos = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: urls[0] },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: urls[1] },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: urls[2] },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: urls[3] },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: urls[4] },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: urls[5] },
    ];

    let loaded = 0;
    faceInfos.forEach((faceInfo) => {
        const { target, url } = faceInfo;
        gl.texImage2D(target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red pixel
        
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = function() {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            loaded++;
            if (loaded === 6) {
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                if (callback) callback();
            }
        };
        image.src = url;
    });
    return texture;
}

function createFloorTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;

    // Create a subtle gradient background
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(0.5, '#34495e');
    gradient.addColorStop(1, '#2c3e50');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Add subtle grid pattern
    ctx.strokeStyle = '#3a4a5a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
    }

    // Add some decorative elements
    ctx.strokeStyle = '#4a5a6a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(256, 256, 100, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(256, 256, 50, 0, 2 * Math.PI);
    ctx.stroke();

    // Add subtle text in a more elegant way
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Computer Graphics Project', 256, 200);
    ctx.font = '14px Arial';
    ctx.fillText('Dimitrios Skoufis 21390317', 256, 320);
    ctx.fillText('Dimitrios Lykoskoufis 21390320', 256, 340);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

// Wait for DOM to be fully loaded before initializing WebGL
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded!");
    
    // Test if we can find the canvas
    const canvas = document.querySelector("#glCanvas");
    if (canvas) {
        console.log("Canvas found:", canvas);
    } else {
        console.error("Canvas not found!");
    }
    
    // Test if we can find the buttons
    const redrawBtn = document.getElementById('redrawBtn');
    if (redrawBtn) {
        console.log("Redraw button found:", redrawBtn);
    } else {
        console.error("Redraw button not found!");
    }
    
    // Small delay to ensure everything is properly set up
    setTimeout(() => {
        console.log("Starting main function...");
        main();
    }, 100);
}); 