// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {

    constructor(gl, program) {
        this.gl = gl;          
        this.program = program;
        this.renderer =
            new Renderer(gl, program);

        // Figura que será exibida
        this.helicopterBody = new HelicopterBody();

        this.helicopterTopShaft = new HelicopterTopShaft();

        this.helicopterTail = new HelicopterTail();

        this.helicopterPropellers = new HelicopterPropellers();

        this.helicopterTailPropeller = new HelicopterTailPropeller();

        this.theta = 0.0;

        this.tx = 0.0;
        this.ty = 0.0;

        this.rotX = 0.0;
        this.rotY = 0.0;

        this.speed = 0.02;
        this.keys = {};

        window.addEventListener("keydown", e => this.keys[e.key] = true);
        window.addEventListener("keyup",   e => this.keys[e.key] = false);
    }

    handleInput(){
        if (this.keys["ArrowUp"])    this.rotX -= this.speed;
        if (this.keys["ArrowDown"])  this.rotX += this.speed;
        if (this.keys["ArrowRight"]) this.rotY += this.speed;
        if (this.keys["ArrowLeft"])  this.rotY -= this.speed;
    }

    update() {
        this.handleInput();
        this.theta += 0.05;

        // rotação global do helicóptero
        const R = m4.multiply(m4.yRotation(this.rotY), m4.xRotation(this.rotX));

        this.helicopterBody.update(R);
        this.helicopterTopShaft.update(R);
        this.helicopterTail.update(R);

        const rotTop = m4.yRotation(this.theta);
        this.helicopterPropellers.update(m4.multiply(R, rotTop));

        const caudaCentro    = m4.translation( 0.7, 0.0,  0.06);
        const caudaCentroInv = m4.translation(-0.7, 0.0, -0.06);
        const rotTail = m4.zRotation(this.theta);
        const localTail = m4.multiply(m4.multiply(caudaCentro, rotTail), caudaCentroInv);
        this.helicopterTailPropeller.update(m4.multiply(R, localTail));
    }

    draw() {

        const gl = this.gl;         // <-- usar this.gl
        const program = this.program;

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        gl.useProgram(program);

        this.helicopterBody.draw(
            this.renderer
        );

        this.helicopterTopShaft.draw(
            this.renderer
        );

        this.helicopterTail.draw(
            this.renderer
        );

        this.helicopterPropellers.draw(
            this.renderer
        );

        this.helicopterTailPropeller.draw(
            this.renderer
        );
    }

    execute() {

        this.update();
        this.draw();

        requestAnimationFrame(
            () => this.execute()
        );
    }

    init() {

        requestAnimationFrame(
            () => this.execute()
        );
    }
}

