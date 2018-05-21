EarthApp = function () {
    Sim.App.call(this);
}

EarthApp.prototype = new Sim.App();

EarthApp.prototype.init = function (params) {
    //调用超类的初始化代码来设置场景、渲染器和默认相机
    Sim.App.prototype.init.call(this, params);
    //创建地球并添加到场景中。
    var earth = new Earth();
    earth.init();
    this.addObject(earth);
    //设置光照
    var sun = new Sun();
    sun.init();
    this.addObject(sun);
}


Earth = function () {
    Sim.Object.call(this);
}
Earth.prototype = new Sim.Object();

Earth.prototype.init = function () {
    //为地球创建纹理
    var earthmap = '../images/earth_surface_2048.jpg';
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var texture = THREE.ImageUtils.loadTexture(earthmap);

    var material = new THREE.MeshPhongMaterial({ map: texture });
    var mesh = new THREE.Mesh(geometry, material);
    //倾斜一下
    mesh.rotation.x = Earth.TILT;
    //把对象反馈给框架
    this.setObject3D(mesh);
}

Earth.prototype.update = function () {
    this.object3D.rotation.y += Earth.ROTATION_Y;
}

Earth.ROTATION_Y = 0.0025;
Earth.TILT = 0.41;

Sun = function () {
    Sim.Object.call(this);
}
Sun.prototype = new Sim.Object();
Sun.prototype.init = function () {
    //创建一个点光源照射地球，并放置于屏幕外部偏左一点的地方
    var light = new THREE.PointLight(0xffffff, 2, 100);
    light.position.set(-10, 0, 20);
    //把对象反馈给框架
    this.setObject3D(light);
}

