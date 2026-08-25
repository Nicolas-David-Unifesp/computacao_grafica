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

const verticesBuffer_Retangl = gl.createBuffer();
const colorsBuffer_Retangl = gl.createBuffer(); // Adicionado aqui

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

const vertexShader_Retangle = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource_square2);
const fragmentShader_Retangle = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource_square2);

const program_retangle = gl.createProgram();
gl.attachShader(program_retangle, vertexShader_Retangle);
gl.attachShader(program_retangle, fragmentShader_Retangle);
gl.linkProgram(program_retangle);

if (!gl.getProgramParameter(program_retangle, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program_retangle));
}

// --------------------------------------------------
// 4. ATRIBUTOS
// --------------------------------------------------

const positionLocation_square2 = gl.getAttribLocation(program_retangle, "aPosition");
const colorsLocation_retangle = gl.getAttribLocation(program_retangle, "aColors");

// --------------------------------------------------
// 5. RENDERIZAÇÃO
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program_retangle);

// --- PRIMEIRO RETÂNGULO ---
let vertices_square2 = setRectangle(-0.6, -0.2, 1.2, 0.4);
let colors_square2 = setRectangleColors(1, 1, 0); // Amarelo

// Posição
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, vertices_square2, gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionLocation_square2);
gl.vertexAttribPointer(positionLocation_square2, 2, gl.FLOAT, false, 0, 0);

// Cor
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, colors_square2, gl.STATIC_DRAW);
gl.enableVertexAttribArray(colorsLocation_retangle);
gl.vertexAttribPointer(colorsLocation_retangle, 3, gl.FLOAT, false, 0, 0);

// Desenha 1º Retângulo
gl.drawArrays(gl.TRIANGLES, 0, vertices_square2.length / 2);

// --- SEGUNDO RETÂNGULO ---
vertices_square2 = setRectangle(-0.2, 0.2, 0.7, 0.3); // Reutilizando a variável, largura, altura
colors_square2 = setRectangleColors(1, 1, 0); // Amarelo (exemplo)

// Atualiza buffer de Posição
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, vertices_square2, gl.STATIC_DRAW);

// Atualiza buffer de Cor
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, colors_square2, gl.STATIC_DRAW);

// Desenha 2º Retângulo
gl.drawArrays(gl.TRIANGLES, 0, vertices_square2.length / 2);

vertices_square2 = setRectangle(-0.1, 0.2, 0.4, 0.26); // Reutilizando a variável, largura, altura
colors_square2 = setRectangleColors(0, 1, 1); // Ciano (exemplo)

// Atualiza buffer de Posição
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, vertices_square2, gl.STATIC_DRAW);

// Atualiza buffer de Cor
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, colors_square2, gl.STATIC_DRAW);

// Desenha 2º Retângulo
gl.drawArrays(gl.TRIANGLES, 0, vertices_square2.length / 2);

vertices_square2 = setRectangle(0.33, 0.2, 0.11, 0.26); // Reutilizando a variável, largura, altura
colors_square2 = setRectangleColors(0, 1, 1); // Ciano (exemplo)

// Atualiza buffer de Posição
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, vertices_square2, gl.STATIC_DRAW);

// Atualiza buffer de Cor
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, colors_square2, gl.STATIC_DRAW);

// Desenha 2º Retângulo
gl.drawArrays(gl.TRIANGLES, 0, vertices_square2.length / 2);