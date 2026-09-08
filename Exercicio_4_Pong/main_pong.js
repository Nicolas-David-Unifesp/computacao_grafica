const canvas = document.getElementById("canvas_pong");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// FUNÇÕES
// --------------------------------------------------

function verticesBarra(){
    return new Float32Array([
        -0.05,  0.2,
        -0.05, -0.2,
         0.05,  0.2,
         0.05,  0.2,
        -0.05, -0.2,
         0.05, -0.2
    ]);
}

function verticesBola(){
    let vertices = [];
    let numSegments = 30;
    let radius = 0.05;

    for (let i = 0; i < numSegments; i++) {
        let theta1 = (i / numSegments) * 2 * Math.PI;
        let theta2 = ((i + 1) / numSegments) * 2 * Math.PI;

        vertices.push(0, 0); // Center of the circle
        vertices.push(radius * Math.cos(theta1), radius * Math.sin(theta1));
        vertices.push(radius * Math.cos(theta2), radius * Math.sin(theta2));
    }

    return new Float32Array(vertices);
}

function drawScene(){
    
    atualizaAnimacao();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    drawBarraEsquerda();
    drawBarraDireita();
    drawBolaCentro();
    
    requestAnimationFrame(drawScene);
}

function drawBarraEsquerda(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraEsquerda,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBarra
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraEsquerda
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraEsquerda.length / numComponents
    );

}

function drawBarraDireita(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraDireita,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBarra
    
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraDireita
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraDireita.length / numComponents
    );

}

function drawBolaCentro(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBolaCentro,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBolaCentro
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbolaCentro
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBolaCentro.length / numComponents
    );

}


function atualizaBarras() {
    if (keys.w) tyBE += paddleSpeed;
    if (keys.s) tyBE -= paddleSpeed;
    if (keys.ArrowUp) tyBD += paddleSpeed;
    if (keys.ArrowDown) tyBD -= paddleSpeed;

    const limiteY = 0.7;
    tyBE = Math.max(-limiteY, Math.min(limiteY, tyBE));
    tyBD = Math.max(-limiteY, Math.min(limiteY, tyBD));

    MbarraEsquerda = m3.translation(-0.9, tyBE);
    MbarraDireita = m3.translation(0.9, tyBD);
}

function verificaColisaoBarra(xBarra, yBarra, lado) {
    const colisaoX =
        Math.abs(txBola - xBarra) <= (larguraBarra / 2) + raioBola;

    const colisaoY =
        Math.abs(tyBola - yBarra) <= (alturaBarra / 2) + raioBola;

    if (colisaoX && colisaoY) {
        if (lado === "esquerda" && txBola_offset < 0) {
            txBola_offset = Math.abs(txBola_offset);
        }

        if (lado === "direita" && txBola_offset > 0) {
            txBola_offset = -Math.abs(txBola_offset);
        }

        // opcional: dá um efeito de "quicar" na vertical conforme
        // a bola toca em diferentes pontos da barra
        tyBola_offset += (tyBola - yBarra) * 0.08;
    }
}


function verificaColisaoBarra(xBarra, yBarra, lado) {
    const colisaoX =
        Math.abs(txBola - xBarra) <= (larguraBarra / 2) + raioBola;

    const colisaoY =
        Math.abs(tyBola - yBarra) <= (alturaBarra / 2) + raioBola;

    if (colisaoX && colisaoY) {
        if (lado === "esquerda" && txBola_offset < 0) {
            txBola_offset = Math.abs(txBola_offset);
        }

        if (lado === "direita" && txBola_offset > 0) {
            txBola_offset = -Math.abs(txBola_offset);
        }
        //Pra bola quicar
        tyBola_offset += (tyBola - yBarra) * 0.08;
    }
}




// --------------------------------------------------
// ATRIBUIÇÃO DE VÉRTICES
// --------------------------------------------------


let verticesBarraDireita = verticesBarra();

let corBarra = new Float32Array([
    1.0, 1.0, 1.0,
]);

let verticesBarraEsquerda = verticesBarra();

let verticesBolaCentro = verticesBola();

let corBolaCentro = new Float32Array([
    1.0, 0.0, 0.0,
]);

// --------------------------------------------------
// TRANSFORMAÇÕES
// --------------------------------------------------

let MbarraEsquerda = m3.translation(-0.9, 0.0);

let MbarraDireita = m3.translation(0.9, 0.0);

let MbolaCentro = m3.identity();

// --------------------------------------------------
// BUFFER
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

// --------------------------------------------------
// VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_transform;

out vec3 vColor;

void main() {
    vec3 position = u_transform * vec3(aPosition, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}

`;


// --------------------------------------------------
// FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
}

`;


// --------------------------------------------------
// COMPILAR SHADERS
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
// CRIAR PROGRAMA
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
// LOCAL DOS ATRIBUTOS E DO UNIFORM
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getUniformLocation(
        program,
        "uColor"
    );

const transformLocation =
    gl.getUniformLocation(
        program,
        "u_transform"
    );

// --------------------------------------------------
// LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// DESENHAR
// --------------------------------------------------

const numComponents = 2;

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    w: false,
    s: false
};

const paddleSpeed = 0.04;


//Efetua a movimentação das barras e da bola
window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (event.key === "ArrowUp") keys.ArrowUp = true;
    if (event.key === "ArrowDown") keys.ArrowDown = true;
    if (key === "w") keys.w = true;
    if (key === "s") keys.s = true;
});

window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();

    if (event.key === "ArrowUp") keys.ArrowUp = false;
    if (event.key === "ArrowDown") keys.ArrowDown = false;
    if (key === "w") keys.w = false;
    if (key === "s") keys.s = false;
});


// --------------------------------------------------
// PARÂMETROS ANIMAÇÃO
// --------------------------------------------------

let tyBE = 0.0;
let tyBD = 0.0;
let txBE_offset = 0.01;
let txBD_offset = 0.01;
let txBola = 0.0;
let tyBola = 0.0;
let txBola_offset = 0.005;
let tyBola_offset = 0.005;
const larguraBarra = 0.1;
const alturaBarra = 0.4;
const raioBola = 0.05;
const pontuacao_esquerda = 0;
const pontuacao_direita = 0;



function atualizaAnimacao(){
    atualizaBarras();

    verificaColisaoBarra(-0.9, tyBE, "esquerda");
    verificaColisaoBarra(0.9, tyBD, "direita");

    txBola += txBola_offset;

    if(txBola > 0.9 || txBola<-0.9){
        txBola_offset = -txBola_offset;
        
        if (txBola > 0.9) {
            // A bola saiu pela direita, ponto para a esquerda
            pontuacao_esquerda++;
        } else {
            // A bola saiu pela esquerda, ponto para a direita
            pontuacao_direita++;
        }
    }
       
    tyBola += tyBola_offset;
    if(tyBola > 1.0 || tyBola<-1.0)
        tyBola_offset = -tyBola_offset;

    MbolaCentro = m3.translation(txBola,tyBola);
}


// --------------------------------------------------
// INÍCIO DO DESENHO
// --------------------------------------------------

drawScene();