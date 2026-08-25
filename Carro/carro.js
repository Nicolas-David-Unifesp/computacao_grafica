const canvas = document.getElementById("carro");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// 1. HELPER FUNCTIONS
// --------------------------------------------------

function setRectangle(x, y, weight, height) {
    return new Float32Array([
        x, y + height,
        x + weight, y + height,
        x + weight, y,
        x, y,
        x + weight, y,
        x, y + height
    ]);
}

function setRectangleColors(r, g, b) {
    let color = [r, g, b];
    let colorValues = [];
    for (let i = 0; i < 6; i++) {
        colorValues.push(...color);
    }
    return new Float32Array(colorValues);
}

// --------------------------------------------------
// 2. BUFFERS (Criar ambos os buffers)
// --------------------------------------------------

const verticesBuffer_square2 = gl.createBuffer();
const colorsBuffer_square2 = gl.createBuffer(); // Adicionado aqui

// --------------------------------------------------
// 3. SHADERS E PROGRAMA
// --------------------------------------------------

const vertexShaderSource_square2 = `#version 300 es
in vec2 aPosition;
in vec3 aColors;
out vec3 vColors;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColors = aColors;
}
`;

//Fragment shader

const fragmentShaderSource_square2 = `#version 300 es
precision mediump float;
in vec3 vColors;
out vec4 outColor;

void main() {
    outColor = vec4(vColors, 1.0);
}
`;

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

const vertexShader_square2 = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource_square2);
const fragmentShader_square2 = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource_square2);

const program_square2 = gl.createProgram();
gl.attachShader(program_square2, vertexShader_square2);
gl.attachShader(program_square2, fragmentShader_square2);
gl.linkProgram(program_square2);

if (!gl.getProgramParameter(program_square2, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program_square2));
}

// --------------------------------------------------
// 4. ATRIBUTOS
// --------------------------------------------------

const positionLocation_square2 = gl.getAttribLocation(program_square2, "aPosition");
const colorsLocation_square2 = gl.getAttribLocation(program_square2, "aColors");

// --------------------------------------------------
// 5. RENDERIZAÇÃO
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program_square2);

// --- PRIMEIRO RETÂNGULO ---
let vertices_square2 = setRectangle(0.25, 0.25, 0.25, 0.25);
let colors_square2 = setRectangleColors(1, 1, 0); // Amarelo

// Posição
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_square2);
gl.bufferData(gl.ARRAY_BUFFER, vertices_square2, gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionLocation_square2);
gl.vertexAttribPointer(positionLocation_square2, 2, gl.FLOAT, false, 0, 0);

// Cor
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_square2);
gl.bufferData(gl.ARRAY_BUFFER, colors_square2, gl.STATIC_DRAW);
gl.enableVertexAttribArray(colorsLocation_square2);
gl.vertexAttribPointer(colorsLocation_square2, 3, gl.FLOAT, false, 0, 0);

// Desenha 1º Retângulo
gl.drawArrays(gl.TRIANGLES, 0, vertices_square2.length / 2);

// --- SEGUNDO RETÂNGULO ---
vertices_square2 = setRectangle(-0.5, -0.5, 0.25, 0.25); // Reutilizando a variável
colors_square2 = setRectangleColors(1, 0, 0); // Vermelho (exemplo)

// Atualiza buffer de Posição
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_square2);
gl.bufferData(gl.ARRAY_BUFFER, vertices_square2, gl.STATIC_DRAW);

// Atualiza buffer de Cor
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_square2);
gl.bufferData(gl.ARRAY_BUFFER, colors_square2, gl.STATIC_DRAW);

// Desenha 2º Retângulo
gl.drawArrays(gl.TRIANGLES, 0, vertices_square2.length / 2);