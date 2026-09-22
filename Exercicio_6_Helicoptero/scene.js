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

        this.speed_keydows = 0.02;
        this.keys = {};

        window.addEventListener("keydown", e => this.keys[e.key] = true);
        window.addEventListener("keyup",   e => this.keys[e.key] = false);
    }

    handleInput(){
        if (this.keys["ArrowUp"])    this.ty += this.speed;
        if (this.keys["ArrowDown"])  this.ty -= this.speed;
        if (this.keys["ArrowRight"]) this.tx += this.speed;
        if (this.keys["ArrowLeft"])  this.tx -= this.speed;
    }

    update() {
        //Pra fazer a translação global
        const T = m4.translation(this.tx, this.ty, 0);
        this.theta += 0.01;

        this.helicopterBody.update(T);
        this.helicopterTopShaft.update(T);
        this.helicopterTail.update(T);

        const rottop = m4.yRotation(this.theta);
        this.helicopterPropellers.update(m4.multiply(T,rottop));

        const tailCenter = m4.translation(0.7, 0.0, 0.06);
        const tailCenterInv = m4.translation(-0.7, 0.0, -0.06);
        const rotTail = m4.zRotation(this.theta);
        const localTail = m4.multiply(m4.multiply(tailCenter, rotTail), tailCenterInv);
        this.helicopterTailPropeller.update(m4.multiply(T, localTail));
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

