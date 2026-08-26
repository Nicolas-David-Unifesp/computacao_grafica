const canvas = document.getElementById("robo");
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

//Cor do círculo
function gerarCoresCirculo(seg, r, g, b) {
    const c = [];

    // O centro e todos os vértices da borda usam a mesma cor (r, g, b)
    for (let i = 0; i <= seg; i++) {
        c.push(r, g, b);
    }

    return new Float32Array(c);
}

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

//Retangulo Base
let vertices_square2 = setRectangle(-0.5, -0.5, 1, 1);
let colors_square2 = setRectangleColors(1, 1, 1); // 

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

// 2º Retângulo
vertices_square2 = setRectangle(-0.6, -0.2, 0.1, 0.4); // Reutilizando a variável, largura, altura
colors_square2 = setRectangleColors(1, 1, 1); // Branco

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, vertices_square2, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, colors_square2, gl.STATIC_DRAW);
gl.drawArrays(gl.TRIANGLES, 0, vertices_square2.length / 2);


// 3º Retângulo
vertices_square2 = setRectangle(0.5, -0.2, 0.101, 0.41); 
colors_square2 = setRectangleColors(1, 1, 1); // Branco

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, vertices_square2, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, colors_square2, gl.STATIC_DRAW);
gl.drawArrays(gl.TRIANGLES, 0, vertices_square2.length / 2);

// 4º Retângulo
vertices_square2 = setRectangle(-0.3, -0.4, 0.6, 0.2); // Reutilizando a variável, largura, altura
colors_square2 = setRectangleColors(1, 1, 0); // Amarelo

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, vertices_square2, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, colors_square2, gl.STATIC_DRAW);
gl.drawArrays(gl.TRIANGLES, 0, vertices_square2.length / 2);

//5º Retângulo
vertices_square2 = setRectangle(-0.008, 0.5, 0.016, 0.4); // Reutilizando a variável, largura, altura
colors_square2 = setRectangleColors(1, 1, 1); // Branco

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, vertices_square2, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, colors_square2, gl.STATIC_DRAW);
gl.drawArrays(gl.TRIANGLES, 0, vertices_square2.length / 2);


// --------------------------------------------------
// A parte de Círculos
// --------------------------------------------------

// --------------------------------------------------
// A parte de Círculos
// --------------------------------------------------


//Olho Esquerdo
let centroX = -0.2;
let centroY = 0.1;
let raio = 0.15;
let segmentos = 50; 

const dadosVertices = gerarVerticesCirculo(centroX, centroY, raio, segmentos);
const colors_circulo = gerarCoresCirculo(segmentos, 1, 1, 0); // Cor amarelo
const indices = gerarIndicesCirculo(segmentos);

// Atualiza buffer de Posição
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, dadosVertices, gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionLocation_square2);
gl.vertexAttribPointer(positionLocation_square2, 2, gl.FLOAT, false, 0, 0);

// Atualiza buffer de Cor
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, colors_circulo, gl.STATIC_DRAW);
gl.enableVertexAttribArray(colorsLocation_retangle);
gl.vertexAttribPointer(colorsLocation_retangle, 3, gl.FLOAT, false, 0, 0);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
gl.useProgram(program_retangle);

// Desenha o círculo usando os índices
gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);


//Olho Direito
centroX = 0.2;
centroY = 0.1;
raio = 0.15;
segmentos = 50; 

const dadosVertices2 = gerarVerticesCirculo(centroX, centroY, raio, segmentos);
const colors_circulo2 = gerarCoresCirculo(segmentos, 1, 1, 0); // Cor amarelo

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, dadosVertices2, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, colors_circulo2, gl.STATIC_DRAW);
gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);

//Antena Base
centroX = 0.0;
centroY = 0.9;
raio = 0.03;
segmentos = 50;

const dadosVertices3 = gerarVerticesCirculo(centroX, centroY, raio, segmentos);
const colors_circulo3 = gerarCoresCirculo(segmentos, 1, 1, 1); // Cor branco

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, dadosVertices3, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, colors_circulo3, gl.STATIC_DRAW);
gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);

// Antena Cima
centroX = 0.0;
centroY = 0.5;
raio = 0.06;
segmentos = 50;

const dadosVertices4 = gerarVerticesCirculo(centroX, centroY, raio, segmentos);
const colors_circulo4 = gerarCoresCirculo(segmentos, 1, 1, 1); // Cor branco

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, dadosVertices4, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_Retangl);
gl.bufferData(gl.ARRAY_BUFFER, colors_circulo4, gl.STATIC_DRAW);
gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);