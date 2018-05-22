TweenApp = function () {
    Sim.App.call(this);
}

TweenApp.prototype = new Sim.App();
// 自定义初始化器
TweenApp.prototype.init = function (params) {
    // 调用超类的代码来建立场景，渲染器和默认相机
    Sim.App.prototype.init.call(this, params);
    // 创建一个照射到球体的点光源
    var light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 0, 20);
    this.scene.add(light);
    this.camera.position.z = 6.667;
    // 创建球体对象并添加到sim框架中
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
    var BALL_TEXTURE = '../images/ball_texture.jpg';
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var material = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture(BALL_TEXTURE) });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -3.333;
    this.setObject3D(mesh);
}

MovingBall.prototype.animate = function () {
    var newpos;
    if (this.object3D.position.x > 0) {
        newpos = this.object3D.position.x - 6.667;
    } else {
        newpos = this.object3D.position.x + 6.667;
    }
    // create a new tween that modifies 'this.object3D.position'
    // move to `newpos` in 2 seconds
    new TWEEN.Tween(this.object3D.position)
        .to({
            x: newpos
        }, 2000).start();
}
