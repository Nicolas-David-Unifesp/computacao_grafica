const canvas = document.getElementById("carro");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

let vertices = [];

function setRectangle(x,y,weight,height){
    // x e y são as coordenadas do canto inferior esquerdo do retângulo, 
    // weight é a largura e height é a altura
    return new Float32Array([
        x,y+height,
        x+weight,y+height,
        x+weight,y,
        x,y,
        x+weight,y,
        x,y+height
    ]);
}


// --------------------------------------------------
// COLORS
// --------------------------------------------------

let colors_square2 = [];

function setRectangleColors(r, g, b) {
    let color = [r, g, b];
    let colorValues = [];
    for(let i=0;i<6;i++)//
        colorValues.push(...color);
    return new Float32Array(colorValues);
}

// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer_square2 = gl.createBuffer();



gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_square2);

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors_square2,
    gl.STATIC_DRAW
);


// --------------------------------------------------
// 3. VERTEX SHADER
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


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource_square2 = `#version 300 es

precision mediump float;

in vec3 vColors;

out vec4 outColor;

void main() {
    outColor = vec4(vColors, 1.0);
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


const vertexShader_square2 = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource_square2
);

const fragmentShader_square2 = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource_square2
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program_square2 = gl.createProgram();

gl.attachShader(program_square2, vertexShader_square2);
gl.attachShader(program_square2, fragmentShader_square2);

gl.linkProgram(program_square2);

if (!gl.getProgramParameter(program_square2, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program_square2)
    );
}


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation_square2 =
    gl.getAttribLocation(
        program_square2,
        "aPosition"
    );

const colorsLocation_square2 =
    gl.getAttribLocation(
        program_square2,
        "aColors"
    );

// --------------------------------------------------
// 8. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

// --------------------------------------------------
// 9. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_square2);


vertices_square2 = setRectangle(0.25,0.25,0.25,0.25);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices_square2,
    gl.STATIC_DRAW
);

gl.enableVertexAttribArray(positionLocation_square2);

gl.vertexAttribPointer(
    positionLocation_square2,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_square2);

colors_square2 = setRectangleColors(1, 1, 0); // amarelo

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors_square2,
    gl.STATIC_DRAW
);

gl.enableVertexAttribArray(colorsLocation_square2);

gl.vertexAttribPointer(
    colorsLocation_square2,
    3,
    gl.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 10. DESENHAR
// --------------------------------------------------

gl.useProgram(program_square2);

gl.drawArrays(
    gl.TRIANGLES,
    0, 
    vertices_square2.length / 2
);

// --------------------------------------------------
// 11. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_square2);


let vertices_square2 = setRectangle(-0.5,-0.5,0.25,0.25);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices_square2,
    gl.STATIC_DRAW
);

gl.enableVertexAttribArray(positionLocation_square2);

gl.vertexAttribPointer(
    positionLocation_square2,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer_square2);

colors_square2 = setRectangleColors(1, 1, 0); // amarelo

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors_square2,
    gl.STATIC_DRAW
);

gl.enableVertexAttribArray(colorsLocation_square2);

gl.vertexAttribPointer(
    colorsLocation_square2,
    3,
    gl.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 12. DESENHAR
// --------------------------------------------------

gl.useProgram(program_square2);

gl.drawArrays(
    gl.TRIANGLES,
    0, 
    vertices_square2.length / 2
);