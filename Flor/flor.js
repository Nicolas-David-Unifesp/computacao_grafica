

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// 1. Vertices
// --------------------------------------------------

const centroX = 0.0;
const centroY = 0.0;
const raio = 0.5;
const segmentos = 50; 

function gerarVerticesCirculo(cx, cy, raio, quantidadeSegmentos) {
    // Array para guardar as coordenadas (X, Y)
    const vertices = [];

    // Vértice 1: O ponto central do círculo
    vertices.push(cx, cy);

    // Vértices seguintes: Pontos ao redor da circunferência
    for (let i = 0; i < quantidadeSegmentos; i++) {
        // Calcula o ângulo atual em radianos (vai de 0 a 2*PI)
        const angulo = (i * 2 * Math.PI) / quantidadeSegmentos;
        
        // Matemática básica: X = cx + r * cos(a), Y = cy + r * sin(a)
        const x = cx + raio * Math.cos(angulo);
        const y = cy + raio * Math.sin(angulo);
        
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}


const dadosVertices = gerarVerticesCirculo(centroX, centroY, raio, segmentos);

//Cor do círculo
function gerarCoresCirculo(seg, r, g, b) {
    const c = [];

    // O centro e todos os vértices da borda usam a mesma cor (r, g, b)
    for (let i = 0; i <= seg; i++) {
        c.push(r, g, b);
    }

    return new Float32Array(c);
}

const colors = gerarCoresCirculo(segmentos, 1.0, 1.0, 0.0); // Cor amarela

function gerarIndicesCirculo(seg) {
    const ind = [];
    
    // Conecta o centro (0) com cada ponto sequencial da borda
    for (let i = 1; i < seg; i++) {
        ind.push(0, i, i + 1);
    }
    
    // Conecta o último triângulo de volta ao primeiro ponto da borda para fechar o círculo
    ind.push(0, seg, 1);
    
    return new Uint16Array(ind);
}

const indices = gerarIndicesCirculo(segmentos);

// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    dadosVertices,
    gl.STATIC_DRAW
);

const colorsBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors,
    gl.STATIC_DRAW
);

const indicesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

//--------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
in vec3 aColor;

out vec3 vColor;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
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

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);


// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// 10. DESENHAR
// --------------------------------------------------

gl.useProgram(program);

gl.drawElements(
    gl.TRIANGLES,
    indices.length,
    gl.UNSIGNED_SHORT,
    0
);