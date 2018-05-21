Orbit = function () {
    Sim.Object.call(this);
}

// 自定义一个轨道类
Orbit.prototype = new Sim.Object();

Orbit.prototype.init = function (distance) {
    // 创建一个空的几何对象用于装载线的顶点数据
    var geometry = new THREE.Geometry();
    var i,
        len = 60,
        twopi = 2 * Math.PI;
    // 创建圆周
    for (i = 0; i <= Orbit.N_SEGMENTS; i++) {
        var x = distance * Math.cos(i / Orbit.N_SEGMENTS * twopi);
        var z = distance * Math.sin(i / Orbit.N_SEGMENTS * twopi);
        var vertex = new THREE.Vertex(new THREE.Vector3(x, 0, z));
        geometry.vertices.push(vertex);
    }

    material = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, linewidth: 2 });

    var line = new THREE.Line(geometry, material);
    this.setObject3D(line);
}

Orbit.N_SEGMENTS = 120;