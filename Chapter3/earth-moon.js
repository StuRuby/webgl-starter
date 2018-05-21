EarthApp = function () {
    Sim.App.call(this);
}
// 继承自 Sim.App
EarthApp.prototype = new Sim.App();

EarthApp.prototype.init = function (params) {
    Sim.App.prototype.init.call(this, params);

    var earth = new Earth();
    earth.init();
    this.addObject(earth);

    var sun = new Sun();
    sun.init();
    this.addObject(sun);

    this.camera.position.z += 1.667;
}

Earth = function () {
    Sim.Object.call(this);
}

Earth.prototype = new Sim.Object();

Earth.prototype.init = function () {
    // 创建一个群组来容纳地球和云层
    var earthGroup = new THREE.Object3D();
    // 将对象反馈给框架
    this.setObject3D(earthGroup);

    // 添加地球和云层
    this.createGlobe();
    this.createClouds();

    // 添加月球
    this.createMoon();
}

Earth.prototype.createGlobe = function () {
    var surfaceMap = THREE.ImageUtils.loadTexture('../images/earth_surface_2048.jpg');
    var normalMap = THREE.ImageUtils.loadTexture('../images/earth_normal_2048.jpg');
    var specularMap = THREE.ImageUtils.loadTexture('../images/earth_specular_2048.jpg');

    var shader = THREE.ShaderUtils.lib['normal'];
    var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['tNormal'].texture = normalMap;
    uniforms['tDiffuse'].texture = surfaceMap;
    uniforms['tSpecular'].texture = specularMap;
    uniforms['enableDiffuse'].value = true;
    uniforms['enableSpecular'].value = true;

    var shaderMaterial = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: uniforms,
        lights: true
    });

    var globeGeometry = new THREE.SphereGeometry(1, 32, 32);
    globeGeometry.computeTangents();
    var globeMesh = new THREE.Mesh(globeGeometry, shaderMaterial);
    globeMesh.rotation.x = Earth.TILT;

    this.object3D.add(globeMesh);
    this.globeMesh = globeMesh;
}

Earth.prototype.createClouds = function () {
    var cloudsMap = THREE.ImageUtils.loadTexture('../images/earth_clouds_1024.png');
    var cloudsMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, map: cloudsMap, transparent: true });

    var cloudsGeometry = new THREE.SphereGeometry(Earth.CLOUDS_SCALE, 32, 32);
    cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    cloudsMesh.rotation.x = Earth.TILT;

    this.object3D.add(cloudsMesh);
    this.cloudsMesh = cloudsMesh;
}

Earth.prototype.createMoon = function () {
    var moon = new Moon();
    moon.init();
    // 将moon作为子类添加给earth
    this.addChild(moon);
}

Earth.prototype.update = function () {
    this.globeMesh.rotation.y += Earth.ROTATION_Y;

    this.cloudsMesh.rotation.y += Earth.CLOUDS_ROTATION_Y;

    Sim.Object.prototype.update.call(this);
}

Earth.ROTATION_Y = 0.0025;
Earth.TILT = 0.41;
Earth.RADIUS = 6371;
Earth.CLOUDS_SCALE = 1.005;
Earth.CLOUDS_ROTATION_Y = Earth.ROTATION_Y * 0.95;

Sun = function () {
    Sim.Object.call(this);
}

Sun.prototype = new Sim.Object();

Sun.prototype.init = function () {
    var light = new THREE.PointLight(0xffffff, 2, 100);
    light.position.set(-10, 0, 20);
    this.setObject3D(light);
}

Moon = function () {
    Sim.Object.call(this);
}
Moon.prototype = new Sim.Object();

Moon.prototype.init = function () {
    var MOONMAP = '../images/moon_1024.jpg';
    // 生成球体
    var geometry = new THREE.SphereGeometry(Moon.SIZE_IN_EARTHS, 32, 32);
    // 纹理
    var texture = THREE.ImageUtils.loadTexture(MOONMAP);
    // 材质  .这种材质类型使用了虽然简单，但是效果逼真，性能也非常高效的着色模型 -- Phong 着色法。
    var material = new THREE.MeshPhongMaterial({
        map: texture,
        ambient: 0x888888
    });
    // 创建月球网格
    var mesh = new THREE.Mesh(geometry, material);
    // 转换成地球尺度的单位 (把地球当做单位球体)
    var distance = Moon.DISTANCE_FROM_EARTH / Earth.RADIUS;
    // 将月球网格放置在合适的位置
    mesh.position.set(Math.sqrt(distance / 2), 0, -Math.sqrt(distance / 2));
    // 旋转月球，让它的一个面始终朝向地球
    mesh.rotation.y = Math.PI;
    // 创建一个群组来容纳月球和地球
    var moonGroup = new THREE.Object3D();
    moonGroup.add(mesh);
    // 向黄道面倾斜
    moonGroup.rotation.x = Moon.INCLINATION;
    // 将对象反馈给框架
    this.setObject3D(moonGroup);
    // 保存月球网格
    this.moonMesh = mesh;
}

Moon.prototype.update = function () {
    // 月球轨道
    this.object3D.rotation.y += (Earth.ROTATION_Y / Moon.PERIOD);
    Sim.Object.prototype.update.call(this);
}

Moon.DISTANCE_FROM_EARTH = 356400;
Moon.PERIOD = 28;
Moon.EXAGGERATE_FACTOR = 1.2;
Moon.INCLINATION = 0.089;
Moon.SIZE_IN_EARTHS = 1 / 3.7 * Moon.EXAGGERATE_FACTOR;
