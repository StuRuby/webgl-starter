//constructor
EarthApp = function () {
    Sim.App.call(this);
}
//子类
EarthApp.prototype = new Sim.App();

//自定义初始化过程
EarthApp.prototype.init = function (param) {
    Sim.App.prototype.init.call(this, param);

    var earth = new Earth();
    earth.init();
    this.addObject(earth);
}

Earth = function () {
    Sim.Object.call(this);
}

Earth.prototype = new Sim.Object();

Earth.prototype.init = function () {
    //创建地球球体并添加纹理
    var earthmap = '../images/earth_surface_2048.jpg';
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var texture = THREE.ImageUtils.loadTexture(earthmap);
    var material = new THREE.MeshBasicMaterial({ map: texture });
    var mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.z = Earth.TILT;

    this.setObject3D(mesh);
}

Earth.prototype.update = function () {
    this.object3D.rotation.y += Earth.ROTATION_Y;
}

Earth.ROTATION_Y = 0.0025;
Earth.TILT = 0.41;
