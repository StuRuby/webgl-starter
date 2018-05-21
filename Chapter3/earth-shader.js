EarthApp = function () {
    Sim.App.call(this);
}

EarthApp.prototype = new Sim.App();

EarthApp.prototype.init = function (params) {
    Sim.App.prototype.init.call(this, params);

    var earth = new Earth();
    earth.init();
    this.addObject(earth);

    var sun = new Sun();
    sun.init();
    this.addObject(sun);
}

Earth = function () {
    Sim.Object.call(this);
}

Earth.prototype = new Sim.Object();

Earth.prototype.init = function () {
    var earthGroup = new THREE.Object3D();
    this.setObject3D(earthGroup);
    this.createGlobe();
    this.createClouds();
}

Earth.prototype.createGlobe = function () {
    // Create our Earth with nice texture - normal map for elevation, specular highlights
    // 创建多重纹理，包括一张用于高度图的法线贴图和一张高光贴图
    var surfaceMap = THREE.ImageUtils.loadTexture("../images/earth_surface_2048.jpg");
    var normalMap = THREE.ImageUtils.loadTexture("../images/earth_normal_2048.jpg");
    var specularMap = THREE.ImageUtils.loadTexture("../images/earth_specular_2048.jpg");

    var shader = THREE.ShaderUtils.lib["normal"],
        uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms["tNormal"].texture = normalMap;
    uniforms["tDiffuse"].texture = surfaceMap;
    uniforms["tSpecular"].texture = specularMap;

    uniforms["enableDiffuse"].value = true;
    uniforms["enableSpecular"].value = true;

    var shaderMaterial = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: uniforms,
        lights: true
    });

    var globeGeometry = new THREE.SphereGeometry(1, 32, 32);

    // We'll need these tangents for our shader
    // 为着色器计算切线
    globeGeometry.computeTangents();
    var globeMesh = new THREE.Mesh(globeGeometry, shaderMaterial);

    // Let's work in the tilt
    // 倾斜地球
    globeMesh.rotation.x = Earth.TILT;

    // Add it to our group
    // 添加到群组中
    this.object3D.add(globeMesh);

    // Save it away so we can rotate it
    // 保存之后就可以旋转了
    this.globeMesh = globeMesh;
}

Earth.prototype.createClouds = function () {
    // 创建云层
    var cloudsMap = THREE.ImageUtils.loadTexture('../images/earth_clouds_1024.png');
    var cloudsMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, map: cloudsMap, transparent: true });
    var cloudsGeometry = new THREE.SphereGeometry(Earth.CLOUDS_SCALE, 32, 32);
    cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    cloudsMesh.rotation.x = Earth.TILT;
    // 添加到群组
    this.object3D.add(cloudsMesh);
    // 保存之后就可以旋转了
    this.cloudsMesh = cloudsMesh;
}

Earth.prototype.update = function () {
    this.globeMesh.rotation.y += Earth.ROTATION_Y;
    this.cloudsMesh.rotation.y += Earth.CLOUDS_ROTATION_Y;
    Sim.Object.prototype.update.call(this);
}

Earth.ROTATION_Y = 0.001;
Earth.TILT = 0.41;
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
