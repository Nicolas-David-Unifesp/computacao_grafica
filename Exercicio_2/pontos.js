const canvas = document.getElementById("canvas_pontos");
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


function drawLine(p1, p2, color) {// Função para desenhar linha usando o Breseham
    const pts = bresenham(p1.px, p1.py, p2.px, p2.py);
    buildBuffers(pts, color);
    drawScene();
}
 
//Função para desenhar triângulo usando o Breseham
function drawTriangle(p1, p2, p3, color) {
    const side1 = bresenham(p1.px, p1.py, p2.px, p2.py);
    const side2 = bresenham(p2.px, p2.py, p3.px, p3.py);
    const side3 = bresenham(p3.px, p3.py, p1.px, p1.py);
    const pts = [...side1, ...side2, ...side3];
    buildBuffers(pts, color);
    drawScene();
}



function uploadBuffer(buffer, data) {//Só pra ficar mais limpo na hora de passar os buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
}



// --------------------------------------------------
// 1. Vertices e mais
// --------------------------------------------------

let vertices = new Float32Array([0.0,0.0]);
let colors = new Float32Array([1.0, 0.0, 0.0]);
let pointSizes = new Float32Array([2.0]);
let mode = "reta"; // Muda os modos entre reta e triangulo
let clickBuffer = []; // buffer pra acumular os cliques



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

// --------------------------------------------------
// 9. INTERAÇÃO COM O MOUSE
// --------------------------------------------------

canvas.addEventListener("mousedown",mouseClick,false);
  
function mouseClick(event){
    // Posição do clique em pixels
    const x = event.offsetX;
    const y = event.offsetY;

    canvasCoordinates.textContent =
        `Canvas: (${x}, ${y})`;

    // Converter X para o intervalo [-1, 1]
    const webglX =
        (x / canvas.width) * 2 - 1;

    // Converter Y para o intervalo [-1, 1]
    // O sinal é invertido porque o eixo Y do canvas
    // cresce para baixo e o do WebGL cresce para cima
    const webglY =
        -((y / canvas.height) * 2 - 1);

    webglCoordinates.textContent =
        `WebGL: (${webglX.toFixed(3)}, ${webglY.toFixed(3)})`;


    // Atualizar o vetor de vértices
    vertices = new Float32Array([
        webglX,
        webglY
    ]);

    // Atualizar o conteúdo do buffer na GPU
    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        verticesBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertices,
        gl.STATIC_DRAW
    );

    // Redesenhar a cena
    drawScene();
}

// --------------------------------------------------
// 10. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// 11. DESENHAR
// --------------------------------------------------

const numComponents = 2;

gl.useProgram(program);

function drawScene(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.drawArrays(
        gl.POINTS,
        0,
        vertices.length / numComponents
    );
}

drawScene();