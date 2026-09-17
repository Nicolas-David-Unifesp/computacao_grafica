const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_viewTransform;
uniform mat3 u_modelTransform;

void main() {

    vec3 position =
        u_viewTransform *
        u_modelTransform *
        vec3(aPosition, 1.0);

    gl_Position =
        vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {

    outColor =
        vec4(uColor, 1.0);
}
`;

function createShader(gl, type, source) {

    const shader =
        gl.createShader(type);

    gl.shaderSource(
        shader,
        source
    );

    gl.compileShader(shader);

    if (
        !gl.getShaderParameter(
            shader,
            gl.COMPILE_STATUS
        )
    ) {

        const error =
            gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}

function createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
) {

    const vertexShader =
        createShader(
            gl,
            gl.VERTEX_SHADER,
            vertexShaderSource
        );

    const fragmentShader =
        createShader(
            gl,
            gl.FRAGMENT_SHADER,
            fragmentShaderSource
        );

    const program =
        gl.createProgram();

    gl.attachShader(
        program,
        vertexShader
    );

    gl.attachShader(
        program,
        fragmentShader
    );

    gl.linkProgram(program);

    if (
        !gl.getProgramParameter(
            program,
            gl.LINK_STATUS
        )
    ) {

        throw new Error(
            gl.getProgramInfoLog(program)
        );
    }

    return program;
}


const program =
    createProgram(
        gl,
        vertexShaderSource,
        fragmentShaderSource
    );


// ==================================================
// CLASSE RENDERER
// ==================================================

class Renderer {

    constructor(gl, program) {
        this.gl = gl;
        this.program = program;

        this.positionLocation =
            gl.getAttribLocation(
                program,
                "aPosition"
            );

        this.colorLocation =
            gl.getUniformLocation(
                program,
                "uColor"
            );

        this.viewTransformLocation =
            gl.getUniformLocation(
                program,
                "u_viewTransform"
            );

        this.modelTransformLocation =
            gl.getUniformLocation(
                program,
                "u_modelTransform"
            );

        this.viewTransform =
            m3.identity();

        this.verticesBuffer =
            gl.createBuffer();
    }

    defineViewTransform(viewTransform) {
        this.viewTransform =
            viewTransform;
    }

    draw(object) {
        const gl = this.gl;

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.verticesBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            object.vertices,
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(
            this.positionLocation
        );

        gl.vertexAttribPointer(
            this.positionLocation,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.uniform3fv(
            this.colorLocation,
            object.color
        );

        gl.uniformMatrix3fv(
            this.modelTransformLocation,
            false,
            object.modelTransform
        );

        gl.uniformMatrix3fv(
            this.viewTransformLocation,
            false,
            this.viewTransform
        );

        gl.drawArrays(
            gl.TRIANGLES,
            0,
            object.vertices.length / 2
        );
    }
}

// ==================================================
// AUXILIARY FUNCTIONS
// ==================================================

function rectangleVertices(x,y,width,height){
    return [
        x, y,
        x+width, y+height,
        x, y+height,

        x, y,
        x+width, y,
        x+width, y+height
    ];
}

function circleVertices(radius,numSegments){
    const vertices = [];

    for (let i = 0; i < numSegments; i++) {
        const theta1 =
            (i / numSegments) *
            2 * Math.PI;

        const theta2 =
            ((i + 1) / numSegments) *
            2 * Math.PI;


        vertices.push(
            0,
            0
        );

        vertices.push(
            radius * Math.cos(theta1),
            radius * Math.sin(theta1)
        );


        vertices.push(
            radius * Math.cos(theta2),
            radius * Math.sin(theta2)
        );
    }

    return vertices;
}

// ==================================================
// ROAD VERTICES
// ==================================================

function roadVertices() {

    const vertices = rectangleVertices(-2.0,-1,4.0,0.8);//x,y,width,height

    return new Float32Array(vertices);
}


// ==================================================
// Robot BODYWORK VERTICES
// ==================================================

function Robot_BodyworkVertices() {

    const vertices = rectangleVertices(0.0,-0.6,0.2,0.5);

    return new Float32Array(vertices);
}

function Robot_headVertices() {
    let vertices = [];

    //Cabeça (Retângulo principal)
    vertices.push(...rectangleVertices(-0.15, -0.1, 0.3, 0.3));

    // 5. Haste da Antena
    vertices.push(...rectangleVertices(-0.015, 0.2, 0.03, 0.1));

    return new Float32Array(vertices);
}

function Robot_other_headVertices() {
    let vertices = [];

    //Olho Esquerdo
    const leftEye = circleVertices(0.035, 16);
    for (let i = 0; i < leftEye.length; i += 2) {
        vertices.push(leftEye[i] - 0.07, leftEye[i + 1] + 0.1);
    }

    //Olho Direito (Círculo)
    const rightEye = circleVertices(0.035, 16);
    for (let i = 0; i < rightEye.length; i += 2) {
        vertices.push(rightEye[i] + 0.07, rightEye[i + 1] + 0.1);
    }

    //Esfera da Antena
    const antennaTop = circleVertices(0.03, 16);
    for (let i = 0; i < antennaTop.length; i += 2) {
        vertices.push(antennaTop[i], antennaTop[i + 1] + 0.32);
    }

    // Boca
    vertices.push(...rectangleVertices(-0.08, -0.05, 0.16, 0.04));

    return new Float32Array(vertices);
}

function RobotLegVertices() {
    const vertices = rectangleVertices(-0.05, -0.4, 0.1, 0.4);
    return new Float32Array(vertices);
}




// ==================================================
// CLASSE SCENE OBJECT
// ==================================================

class SceneObject {

    constructor(vertices, color) {

        this.vertices = vertices;

        this.color = color; 

        this.modelTransform = m3.identity();
    }

    updateModelTransform(modelTransform) {

        this.modelTransform = modelTransform;
    }
}


// ==================================================
// CLASSE ROAD
// ==================================================

class Road extends SceneObject {

    constructor() {

        super(
            roadVertices(),

            new Float32Array([
                0.2,
                0.2,
                0.2
            ])
        );
    }


    draw(renderer) {

        renderer.draw(this);
    }
}


// ==================================================
// CLASSE Robot BODYWORK
// ==================================================

class Robot_Bodywork extends SceneObject {

    constructor(color) {

        super(

            Robot_BodyworkVertices(),

            color
        );
    }
}


class Robot_Head extends SceneObject {
    constructor(color) {
        super(
            Robot_headVertices(),
            color
        );
    }
}

class Robot_Eyes extends SceneObject {
    constructor(color) {
        super(
            Robot_other_headVertices(),
            color
        );
    }
}

class Robot_Leg extends SceneObject {
    constructor(color) {
        super(
            RobotLegVertices(),
            color
        );
    }
}


// ==================================================
// CLASSE Robot WHEEL
// ==================================================

/*class RobotWheel extends SceneObject {

    constructor(xPosition, angularSpeed) {

        super(

            RobotWheelVertices(),

            new Float32Array([
                0.5,
                0.5,
                0.5
            ])
        );

        this.xPosition = xPosition;

        this.theta = 0.0;

        this.angularSpeed = angularSpeed;
    }


    updateAngularSpeed(angularSpeed) {

        this.angularSpeed = angularSpeed;
    }

    updateRotation() {

        this.theta += this.angularSpeed;
    }


    updateModelTransform(RobotModelTransform) {

        const localTransform =

            m3.multiply(
                m3.translation(this.xPosition,0.0),
                m3.rotation(this.theta)
            );

        this.modelTransform =

            m3.multiply(
                RobotModelTransform,
                localTransform
            );
    }
}*/


// ==================================================
// CLASSE Robot
// ==================================================

class Robot {
    
    constructor(tx, ty, color, speed) {
        this.tx = tx;
        this.ty = ty;
        this.speed = speed;

        this.Robot_Bodywork = new Robot_Bodywork(color);
        
        // Instancia a cabeça (usando uma cor diferente, ex: azul/cinza)
        this.Robot_Head = new Robot_Head(new Float32Array(color));
        
        // Instancia os olhos (usando uma cor diferente, ex: amarelo)
        this.Robot_Eyes = new Robot_Eyes(new Float32Array([1.0, 1.0, 0.0]));

        this.Robot_Leg = new Robot_Leg(new Float32Array(color));
    }

    move() {
        this.tx += this.speed;

        if (this.tx > 1.8 || this.tx < -1.8) {
            this.speed = -this.speed;
        }

        const RobotTransform = m3.translation(this.tx, this.ty);

        // Aplica a transformação base ao corpo e à cabeça
        this.Robot_Bodywork.updateModelTransform(RobotTransform);
        
        // Posição da cabeça acima do corpo
        const headOffset = m3.translation(0.1, -0.1); // Ajustado para centralizar no corpo
        const headTransform = m3.multiply(RobotTransform, headOffset);
        
        const legOffset = m3.translation(0.1, -0.6); // Ajustado para posicionar a perna abaixo do corpo
        const legTransform = m3.multiply(RobotTransform, legOffset);
        
        this.Robot_Head.updateModelTransform(headTransform);
        this.Robot_Eyes.updateModelTransform(headTransform);
        this.Robot_Leg.updateModelTransform(legTransform);
    }

    draw(renderer) {
        renderer.draw(this.Robot_Bodywork);
        renderer.draw(this.Robot_Head);
        renderer.draw(this.Robot_Eyes);
        renderer.draw(this.Robot_Leg);
    }
}


// ==================================================
// CLASSE SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer = new Renderer(gl,program);

        this.viewTransform = m3.setClippingWindow(-2.0,-1.0,2.0,1.0);

        this.renderer.defineViewTransform(this.viewTransform);

        this.road = new Road();

        this.Robots = [

            new Robot(0.5,0.2,new Float32Array([1.0,0.0,0.0]),0.003)

        ];
    }

    update() {

        for (const Robot of this.Robots) {
            Robot.move();
        }
    }

    draw() {

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        this.road.draw(this.renderer);

        for (const Robot of this.Robots) {
            Robot.draw(this.renderer);
        }
    }

    execute() {

        this.update();

        this.draw();

        requestAnimationFrame(() => this.execute());
    }

    init() {

        requestAnimationFrame(() => this.execute());
    }
}


// ==================================================
// CONFIGURAÇÃO INICIAL DO WEBGL
// ==================================================

gl.clearColor(
    0.1,
    0.1,
    0.1,
    1.0
);

gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
);


// ==================================================
// CRIAR CENA
// ==================================================

const scene =
    new Scene(gl,program);


// ==================================================
// INICIAR ANIMAÇÃO
// ==================================================

scene.init();