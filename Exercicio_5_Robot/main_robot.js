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
    const vertices_perna = rectangleVertices(-0.05, -0.35, 0.1, 0.4);
    return new Float32Array(vertices_perna);
}

function RobotWheelVertices() {
    const vertices_roda = circleVertices(0.07, 10);// raio, número de segmentos
    return new Float32Array(vertices_roda);
}

// --------------------------------------------------
// CORREÇÃO 1: geometria do braço
// O braço agora "pendura" a partir do ombro (pivô em 0,0 no topo)
// e é centralizado em x=0. Assim a rotação gira em torno do ombro,
// e o mesmo modelo serve para o braço esquerdo e direito.
// --------------------------------------------------
function RobotArmVertices() {
    // x=-0.03, y=-0.4, largura=0.06, altura=0.4  -> vai de y=-0.4 (mão) até y=0 (ombro)
    const vertices = rectangleVertices(-0.03, -0.4, 0.06, 0.40);
    return new Float32Array(vertices);
}

function complementColor(color) {
    return new Float32Array([1.0 - color[0], 1.0 - color[1], 1.0 - color[2]]);
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

class RobotWheel extends SceneObject {

    constructor(xPosition, yPosition, angularSpeed) { // Adicionado yPosition

        super(
            RobotWheelVertices(),
            new Float32Array([0.5, 0.5, 0.5])
        );

        this.xPosition = xPosition;
        this.yPosition = yPosition; // Armazena a posição Y
        this.theta = 0.0;
        this.angularSpeed = angularSpeed;
    }

    updateModelTransform(RobotModelTransform) {

        const localTransform =
            m3.multiply(
                m3.translation(this.xPosition, this.yPosition), // Aplica Y aqui
                m3.rotation(this.theta)
            );

        this.modelTransform =
            m3.multiply(
                RobotModelTransform,
                localTransform
            );
    }

    updateRotation() {
        this.theta += this.angularSpeed;
    }
}

class Robot_Arm extends SceneObject {
    constructor(color) {
        super(
            RobotArmVertices(),
            new Float32Array(color)
        );
    }
}




// ==================================================
// CLASSE Robot
// ==================================================

class Robot {

    constructor(tx, ty, color, speed) {
        this.tx = tx;
        this.ty = ty;
        this.speed = speed;
        this.legAngle = 0;
        this.ampDir = 3;
        this.ampEsq = 0.9;

        this.Robot_Bodywork = new Robot_Bodywork(color);
        this.Robot_Head = new Robot_Head(new Float32Array(color));
        this.Robot_Eyes = new Robot_Eyes(new Float32Array([1.0, 1.0, 0.0]));
        this.Robot_Leg = new Robot_Leg(new Float32Array(color));
        this.Robot_Wheel = new RobotWheel(0.0, -0.35, 0.1);
        this.Robot_Arm_dir = new Robot_Arm(color);
        this.Robot_Arm_esq = new Robot_Arm(color);
        this.armAngleDir = 0;
        this.armAngleEsq = 0;
        this.waveTime = 0;
        
    }

    move() {
        this.tx += this.speed;

        if (this.tx > 1.55 || this.tx < -1.69) {
            this.speed = -this.speed;
            const tmp = this.ampDir;
            this.ampDir = this.ampEsq;
            this.ampEsq = tmp;
        }

        const zone = 0.8;
        const maxAngle = Math.PI / 4;

        // Ângulo das pernas em função da proximidade da parede
        if (this.tx > 1.8 - zone) {
            const t = (this.tx - (1.8 - zone)) / zone;
            this.legAngle = t * maxAngle;
        } else if (this.tx < -1.8 + zone) {
            const t = ((-1.8 + zone) - this.tx) / zone;
            this.legAngle = -t * maxAngle;
        } else {
            this.legAngle += (0 - this.legAngle) * 0.05;
        }

        // Rotação do corpo inteiro (o tronco balança um pouco)
        const bodyAngle = this.legAngle * 0.3;

        const RobotTransform = m3.multiply(
            m3.translation(this.tx, this.ty),
            m3.rotation(bodyAngle)
        );

        this.Robot_Bodywork.updateModelTransform(RobotTransform);

        const headOffset = m3.multiply(
            m3.translation(0.1, -0.1),
            m3.rotation(bodyAngle * 0.5) // cabeça rotaciona menos ainda
        );
        const headTransform = m3.multiply(RobotTransform, headOffset);
        this.Robot_Head.updateModelTransform(headTransform);
        this.Robot_Eyes.updateModelTransform(headTransform);

        const legOffset = m3.multiply(
            m3.translation(0.1, -0.6),
            m3.rotation(this.legAngle)
        );
        const legTransform = m3.multiply(RobotTransform, legOffset);

        this.Robot_Leg.updateModelTransform(legTransform);
        this.Robot_Wheel.updateRotation();
        this.Robot_Wheel.updateModelTransform(legTransform);

        
        const armPivotDirX = 0.19;   // ombro direito
        const armPivotDirY = -0.16;

        const armPivotEsqX = 0.01;   // ombro esquerdo
        const armPivotEsqY = -0.16;

        this.waveTime += 0.07;

        

        let alvoDir = -Math.sin(this.waveTime) * this.ampDir + bodyAngle;
        let alvoEsq =  Math.sin(this.waveTime) * this.ampEsq + bodyAngle;


        // Impede o braço de girar para dentro do corpo:
        alvoDir = Math.max(alvoDir, bodyAngle);   //pro braço não entrar dentro do corpo
        alvoEsq = Math.min(alvoEsq, bodyAngle);   

        this.armAngleDir += (alvoDir - this.armAngleDir) * 0.1;
        this.armAngleEsq += (alvoEsq - this.armAngleEsq) * 0.1;

        const armOffsetDir = m3.multiply(
            m3.translation(armPivotDirX, armPivotDirY),
            m3.rotation(this.armAngleDir)
        );
        const armTransformDir = m3.multiply(RobotTransform, armOffsetDir);
        this.Robot_Arm_dir.updateModelTransform(armTransformDir);

        const armOffsetEsq = m3.multiply(
            m3.translation(armPivotEsqX, armPivotEsqY),
            m3.rotation(this.armAngleEsq)
        );
        const armTransformEsq = m3.multiply(RobotTransform, armOffsetEsq);
        this.Robot_Arm_esq.updateModelTransform(armTransformEsq);
    }

    draw(renderer) {
        renderer.draw(this.Robot_Bodywork);
        renderer.draw(this.Robot_Arm_dir);
        renderer.draw(this.Robot_Arm_esq);
        renderer.draw(this.Robot_Head);
        renderer.draw(this.Robot_Eyes);
        renderer.draw(this.Robot_Leg);
        renderer.draw(this.Robot_Wheel);
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
