TweenApp = function () {
    Sim.App.call(this);
}

TweenApp.prototype = new Sim.App();

TweenApp.prototype.init = function (params) {
    Sim.App.prototype.init.call(this, params);

    var light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 0, 20);
    this.scene.add(light);

    this.camera.position.z = 13;

    var movingBall = new MovingBall();
    movingBall.init();
    this.addObject(movingBall);
    this.movingBall = movingBall;
}

TweenApp.prototype.update = function () {
    TWEEN.update();
    Sim.App.prototype.update.call(this);
}

TweenApp.prototype.handleMouseUp = function (x, y) {
    this.movingBall.animate();
}

MovingBall = function () {
    Sim.Object.call(this);
}

MovingBall.prototype = new Sim.Object();

MovingBall.prototype.init = function () {
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var material = new THREE.MeshPhongMaterial(
        { map: THREE.ImageUtils.loadTexture('../images/ball_texture.jpg') }
    );

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 3.333;
    this.setObject3D(mesh);
}

MovingBall.prototype.animate = function () {
    var newpos, easefn;
    if (this.object3D.position.y > 0) {
        newpos = this.object3D.position.y - 6.667;
        easefn = MovingBall.useBounceFunction ?
            TWEEN.Easing.Bounce.EaseOut :
            TWEEN.Easing.Quadratic.EaseOut;
    } else {
        newpos = this.object3D.position.y + 6.667;
        easefn = MovingBall.useBounceFunction ?
            TWEEN.Easing.Bounce.EaseIn :
            TWEEN.Easing.Quadratic.EaseIn;
    }

    new TWEEN.Tween(this.object3D.position)
        .to({
            y: newpos
        }, 2000)
        .easing(easefn)
        .start()
}

MovingBall.useBounceFunction = false;
