RobotApp = function () {
    Sim.App.call(this);
}

RobotApp.prototype = new Sim.App();

RobotApp.prototype.init = function (params) {

    Sim.App.prototype.init.call(this, params);

    var light = new THREE.DirectionalLight(0xeeeeff, 1);
    light.position.set(0, 0, 1);
    this.scene.add(light);

    this.camera.position.set(0, 2.333, 8);

    var robot = new Robot();
    robot.init();
    this.addObject(robot);

    this.root.rotation.y = Math.PI / 4;
    this.robot = robot;
    this.animating = false;
    this.robot.subscribe('complete', this, this.onAnimationComplete);
}

RobotApp.prototype.update = function () {
    this.root.rotation.y += 0.005;
    Sim.App.prototype.update.call(this);
}

RobotApp.prototype.handleMouseUp = function (x, y) {
    this.animating = !this.animating;
    this.robot.animate(this.animating);
}

RobotApp.prototype.onAnimationComplete = function () {
    this.animating = false;
}

RobotApp.animation_time = 1111;

Robot = function () {
    Sim.Object.call(this);
}

Robot.prototype = new Sim.Object();

Robot.prototype.init = function () {
    // 创建装载机器人的群组
    var bodyGroup = new THREE.Object3D();
    this.setObject3D(bodyGroup);

    var that = this;
    var url = '../models/robot_cartoon_02/robot_cartoon_02.dae';
    var loader = new Sim.ColladaLoader;
    loader.load(url, function (data) {
        that.handleLoaded(data);
    });
}

Robot.prototype.handleLoaded = function (data) {
    if (data) {
        var model = data.scene;
        // 这个模型使用的单位是厘米，而我们的工作单位是米，要进行转换
        model.scale.set(0.01, 0.01, 0.01);
        this.object3D.add(model);

        var that = this;
        // 遍历模型寻找带有名称的各个部分。
        THREE.SceneUtils.traverseHierarchy(model, function (n) {
            that.traverseCallback(n);
        });

        this.createAnimation();
    }
}

Robot.prototype.traverseCallback = function (n) {
    // 找到需要发生动画效果的各个部分
    switch (n.name) {
        case 'jambe_G':
            this.left_leg = n;
            break;
        case 'jambe_D':
            this.right_leg = n;
            break;
        case 'head_container':
            this.head = n;
            break;
        case 'clef':
            this.key = n;
            break;
        default:
            break;
    }
}

Robot.prototype.createAnimation = function () {
    this.animator = new Sim.KeyFrameAnimator;
    this.animator.init({
        interps: [
            { keys: Robot.bodyRotationKeys, values: Robot.bodyRotationValues, target: this.object3D.rotation },
            { keys: Robot.headRotationKeys, values: Robot.headRotationValues, target: this.head.rotation },
            { keys: Robot.keyRotationKeys, values: Robot.keyRotationValues, target: this.key.rotation },
            { keys: Robot.leftLegRotationKeys, values: Robot.leftLegRotationValues, target: this.left_leg.rotation },
            { keys: Robot.rightLegRotationKeys, values: Robot.rightLegRotationValues, target: this.right_leg.rotation },
        ],
        loop: true,
        duration: RobotApp.animation_time
    });

    this.animator.subscribe('complete', this, this.onAnimationComplete);

    this.addChild(this.animator);
}

Robot.prototype.animate = function (on) {
    if (on) {
        this.animator.start();
    } else {
        this.animator.stop();
    }
}

Robot.prototype.onAnimationComplete = function () {
    this.publish('complete');
}
Robot.headRotationKeys = [0, .25, .5, .75, 1];
Robot.headRotationValues = [
    { z: 0 },
    { z: -Math.PI / 96 },
    { z: 0 },
    { z: Math.PI / 96 },
    { z: 0 },
];

Robot.bodyRotationKeys = [0, .25, .5, .75, 1];
Robot.bodyRotationValues = [
    { x: 0 },
    { x: -Math.PI / 48 },
    { x: 0 },
    { x: Math.PI / 48 },
    { x: 0 },
];

Robot.keyRotationKeys = [0, .25, .5, .75, 1];
Robot.keyRotationValues = [
    { x: 0 },
    { x: Math.PI / 4 },
    { x: Math.PI / 2 },
    { x: Math.PI * 3 / 4 },
    { x: Math.PI },
];

Robot.leftLegRotationKeys = [0, .25, .5, .75, 1];
Robot.leftLegRotationValues = [
    { z: 0 },
    { z: Math.PI / 6 },
    { z: 0 },
    { z: 0 },
    { z: 0 },
];

Robot.rightLegRotationKeys = [0, .25, .5, .75, 1];
Robot.rightLegRotationValues = [
    { z: 0 },
    { z: 0 },
    { z: 0 },
    { z: Math.PI / 6 },
    { z: 0 },
];