const canvas = document.getElementById("espessuraCanvas");
const gl = canvas.getContext("webgl2");



if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

const canvasCoordinates =
    document.getElementById(
        "canvasCoordinates"
    );

const webglCoordinates =
    document.getElementById(
        "webglCoordinates"
    );

    //Vai ser usado para mostrar o modo do desenho - se é linha ou triângulo
const modeDisplay = 
    document.getElementById(
        "modeDisplay"
    );

const colorDisplay = document.getElementById("colorDisplay");

const colorOptions = {
    "0": { name: "Ciano", value: [0.0, 0.8, 1.0] },
    "1": { name: "Vermelho", value: [1.0, 0.0, 0.0] },
    "2": { name: "Verde", value: [0.0, 1.0, 0.0] },
    "3": { name: "Azul", value: [0.0, 0.0, 1.0] },
    "4": { name: "Amarelo", value: [1.0, 1.0, 0.0] },
    "5": { name: "Magenta", value: [1.0, 0.0, 1.0] },
    "6": { name: "Laranja", value: [1.0, 0.5, 0.0] },
    "7": { name: "Branco", value: [1.0, 1.0, 1.0] },
    "8": { name: "Cinza", value: [0.5, 0.5, 0.5] },
    "9": { name: "Roxo", value: [0.5, 0.0, 1.0] }
};

 // --------------------------------------------------
// 0. Funções
// --------------------------------------------------

function bresenham(x0, y0, x1, y1) {
    const points = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
 
    let x = x0, y = y0;
 
    while (true) {
        points.push({ px: x, py: y });
        if (x === x1 && y === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x += sx; }
        if (e2 <  dx) { err += dx; y += sy; }
    }
    return points;
}


function pixelToWebGL(px, py) { //Função para converter coordenadas de pixel para coordenadas WebGL
    const wx =  (px / canvas.width)  * 2 - 1;
    const wy = -((py / canvas.height) * 2 - 1);
    return [wx, wy];
}


//Função para construir os buffers de vértices, cores e tamanhos de ponto a partir da lista de pontos e da cor especificada
function buildBuffers(pointList, color) {
    const n = pointList.length;
    const verts = new Float32Array(n * 2);
    const cols  = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
 
    for (let i = 0; i < n; i++) {
        const [wx, wy] = pixelToWebGL(pointList[i].px, pointList[i].py);
        verts[i * 2]     = wx;
        verts[i * 2 + 1] = wy;
        cols[i * 3]      = color[0];
        cols[i * 3 + 1]  = color[1];
        cols[i * 3 + 2]  = color[2];
        sizes[i] = 2.0;
    }
 
    vertices  = verts;
    colors    = cols;
    pointSizes = sizes;
 
    uploadBuffer(verticesBuffer,   vertices);
    uploadBuffer(colorsBuffer,     colors);
    uploadBuffer(pointSizesBuffer, pointSizes);
}


function drawLine(p1, p2) {
    const pts = bresenham(p1.px, p1.py, p2.px, p2.py);
    addPointsToCanvas(pts);
}
 
function drawTriangle(p1, p2, p3) {
    const side1 = bresenham(p1.px, p1.py, p2.px, p2.py);
    const side2 = bresenham(p2.px, p2.py, p3.px, p3.py);
    const side3 = bresenham(p3.px, p3.py, p1.px, p1.py);
    addPointsToCanvas([...side1, ...side2, ...side3]);
}

function addPointsToCanvas(pointList) {
    allPoints = [];

    for (let i = 0; i < pointList.length; i++) {
        const [wx, wy] = pixelToWebGL(pointList[i].px, pointList[i].py);
        allPoints.push(wx, wy);
    }
    updateBuffers();
}

function uploadBuffer(buffer, data) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

function updateBuffers() {
    const totalPoints = allPoints.length / 2;
    const verts = new Float32Array(allPoints);
    const cols = new Float32Array(totalPoints * 3);
    const sizes = new Float32Array(totalPoints);

    for (let i = 0; i < totalPoints; i++) {
        cols[i * 3] = selectedColor[0];
        cols[i * 3 + 1] = selectedColor[1];
        cols[i * 3 + 2] = selectedColor[2];
        sizes[i] = 2.0;
    }

    uploadBuffer(verticesBuffer, verts);
    uploadBuffer(colorsBuffer, cols);
    uploadBuffer(pointSizesBuffer, sizes);

    drawScene();
}

function drawScene() {
    // Configura o viewport e limpa a tela
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (allPoints.length === 0) return;

    // Usa o programa compilado
    gl.useProgram(program);

    // Renderiza todos os pontos acumulados
    gl.drawArrays(gl.POINTS, 0, allPoints.length / 2);
}


// --------------------------------------------------
// 1. Vertices e mais
// --------------------------------------------------

let vertices = new Float32Array([0.0,0.0]);
let colors = new Float32Array([0.0, 0.0, 0.0]);
let pointSizes = new Float32Array([2.0]);
let mode = "reta"; // Muda os modos entre reta e triangulo
let clickBuffer = []; // buffer pra acumular os cliques
let allPoints = []; // buffer pra acumular todos os pontos desenhados
let selectedColor = colorOptions["0"].value;


// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();
const colorsBuffer = gl.createBuffer();
const pointSizesBuffer = gl.createBuffer();


// Inicializa os buffers com os dados iniciais, sem precisar usar
//muitas linhas de código à toa
uploadBuffer(verticesBuffer, vertices);
uploadBuffer(colorsBuffer, colors);
uploadBuffer(pointSizesBuffer, pointSizes);


// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
in vec3 aColor;
in float aPointSize;

out vec3 vColor;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = aPointSize;
    vColor = aColor;
}

`;


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vColor;
out vec4 outColor;

void main() {
    outColor = vec4(vColor, 1.0);
}

`;


// --------------------------------------------------
// 5. COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(error);
    }
    return shader;
}


const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
        gl.getProgramInfoLog(program)
    );
}


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getAttribLocation(
        program,
        "aColor"
    );

const pointSizeLocation =
    gl.getAttribLocation(
        program,
        "aPointSize"
    );

// --------------------------------------------------
// 8. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(
    colorLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
gl.enableVertexAttribArray(pointSizeLocation);
gl.vertexAttribPointer(
    pointSizeLocation,
    1,
    gl.FLOAT,
    false,
    0,
    0
);
//--------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

//--------------------------------------------------
// 9. INTERAÇÃO COM O TECLADO
//--------------------------------------------------

document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key === "r") {
        mode = "reta";
        clickBuffer = [];
        modeDisplay.textContent = "Modo: Reta  (clique 2× para traçar)";
    } else if (key === "t") {
        mode = "triangulo";
        clickBuffer = [];
        modeDisplay.textContent = "Modo: Triângulo  (clique 3× para traçar)";
    }

    if (colorOptions[key]) {
        selectedColor = colorOptions[key].value;
        colorDisplay.textContent = `Cor: ${colorOptions[key].name} (${key})`;
    }
});

// --------------------------------------------------
// 10. INTERAÇÃO COM O MOUSE
// --------------------------------------------------

canvas.addEventListener("mousedown",mouseClick,false);
  
function mouseClick(event) {
    const px = event.offsetX;
    const py = event.offsetY;

    canvasCoordinates.textContent = `Canvas: (${px}, ${py})`;

    const [wx, wy] = pixelToWebGL(px, py);
    webglCoordinates.textContent = `WebGL: (${wx.toFixed(3)}, ${wy.toFixed(3)})`;

    clickBuffer.push({ px, py });

    if (mode === "reta" && clickBuffer.length === 2) {
        const [p1, p2] = clickBuffer;
        drawLine(p1, p2);
        clickBuffer = [];
    } else if (mode === "triangulo" && clickBuffer.length === 3) {
        const [p1, p2, p3] = clickBuffer;
        drawTriangle(p1, p2, p3);
        clickBuffer = [];
    }
}