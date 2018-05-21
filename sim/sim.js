Sim = {};
//这个类是所有可以触发事件的对象的基类。当一个事件发生时，Sim.Publisher就会遍历注册的回调列表，
//调用每一个事件数据和提供给它相应的事件处理对象。
Sim.Publisher = function () {
    this.messageTypes = {};
}

Sim.Publisher.prototype.subscribe = function (message, subscriber, callback) {
    var subscribers = this.messageTypes[message];
    if (subscribers) {
        if (this.findSubscriber(subscribers, subscriber) != -1) {
            return;
        }
    } else {
        subscribers = [];
        this.messageTypes[message] = subscribers;
    }
    subscribers.push({
        subscriber,
        callback
    });
}

Sim.Publisher.prototype.unsubscribe = function (message, subscriber, callback) {
    if (subscriber) {
        var subscribers = this.messageTypes[message];
        if (subscribers) {
            var i = this.findSubscriber(subscribers, subscriber, callback);
            if (i != -1) {
                this.messageTypes[message].splice(i, 1);
            }
        }
    } else {
        delete this.messageTypes[message];
    }
}

Sim.Publisher.prototype.publish = function (message) {
    var subscribers = this.messageTypes[message];

    if (subscribers) {
        for (var i = 0; i < subscribers.length; i++) {
            var args = [];
            for (var j = 0; j < arguments.length - 1; j++) {
                args.push(arguments[j + 1]);
            }
            subscribers[i].callback.apply(subscribers[i].subscriber, args);
        }
    }
}

Sim.Publisher.prototype.findSubscriber = function (subscribers, subscriber) {
    for (var i = 0; i < subscribers.length; i++) {
        if (subscribers[i] == subscriber) {
            return i;
        }
    }
    return -1;
}


// 这个类封装了所有 Three.js 中的建立或删除操作的代码，比如创建渲染器，顶层场景和相机 。同时还加入了处理DOM事件的部分，
// 可以控制画布的缩放，鼠标输入和其他事件。Sim.App同时管理应用中不同对象的列表，还负责进行循环重绘.
Sim.App = function () {
    Sim.Publisher.call(this);
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.objects = [];
}
Sim.App.prototype.init = function (params) {
    params = params || {};
    var container = params.container;
    var canvas = params.canvas;

    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas
    });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0x505050));
    scene.data = this;

    camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 1, 10000);
    camera.position.set(0, 0, 3, 3333);

    scene.add(camera);

    var root = new THREE.Object3D();
    scene.add(root);

    var projector = new THREE.Projector();

    this.container = container;
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.projector = projector;
    this.root = root;

    this.initMouse();
    this.initKeyboard();
    this.addDomHandlers();
}

Sim.App.prototype.run = function () {
    this.update();
    this.renderer.render(this.scene, this.camera);
    var self = this;
    requestAnimationFrame(function () {
        self.run();
    });
}

Sim.App.prototype.update = function () {
    var i, len;
    len = this.objects.length;
    for (var i = 0; i < len; i++) {
        this.objects[i].update();
    }
}

Sim.App.prototype.addObject = function (obj) {
    this.objects.push(obj);
    if (obj.object3D) {
        this.root.add(obj.object3D);
    }
}

Sim.App.prototype.removeObject = function (obj) {
    var index = this.objects.indexOf(obj);
    if (index != -1) {
        this.objects.splice(index, 1);
        if (obj.object3D) {
            this.root.remove(obj.object3D);
        }
    }
}

//Event handling
Sim.App.prototype.initMouse = function () {
    var dom = this.renderer.domElement;

    var that = this;
    dom.addEventListener('mousemove', function (e) {
        that.onDocumentMouseMove(e);
    }, false);
    dom.addEventListener('mousedown', function (e) {
        that.onDocumentMouseDown(e);
    }, false);
    dom.addEventListener('mouseup', function (e) {
        that.onDocumentMouseUp(e);
    }, false);

    $(dom).mousewheel(
        function (e, delta) {
            that.onDocumentMouseScroll(e, delta);
        }
    );

    this.overObject = null;
    this.clickedObject = null;
}

Sim.App.prototype.initKeyboard = function () {
    var dom = this.renderer.domElement;
    var that = this;
    dom.addEventListener('keydown', function (e) {
        this.onKeyDown(e);
    }, false);
    dom.addEventListener('keyup', function (e) {
        this.onKeyUp(e);
    }, false);
    dom.addEventListener('keypress', function (e) {
        this.onKeyPress(e);
    }, false);

    dom.setAttribute('tabindex', 1);
    dom.style.outline = 'none';
}

Sim.App.prototype.addDomHandlers = function () {
    var that = this;
    window.addEventListener('resize', function (evt) {
        that.onWindowResize(evt);
    }, false);
}

Sim.App.prototype.onDocumentMouseMove = function (evt) {
    evt.preventDefault();
    if (this.clickedObject && this.clickedObject.handleMouseMove) {
        var hitpoint = null,
            hitnormal = null;
        var intersected = this.objectFromMouse(evt.pageX, evt.pageY);
        if (intersected.object == this.clickedObject) {
            hitpoint = intersected.point;
            hitnormal = intersected.normal;
        }
        this.clickedObject.handleMouseMove(evt.pageX, evt.pageY, hitpoint, hitnormal);
    } else {
        var handled = false;
        var oldObj = this.overObject;
        var intersected = this.objectFromMouse(evt.pageX, evt.pageY);

        this.overObject = intersected.object;

        if (this.overObject != oldObj) {
            if (oldObj) {
                this.container.style.cursor = 'auto';
                if (oldObj.handleMouseOut) {
                    oldObj.handleMouseOut(evt.pageX, evt.pageY);
                }
            }

            if (this.overObject) {
                if (this.overObject.overCursor) {
                    this.container.style.cursor = this.overObject.overCursor;
                }
                if (this.overObject.handleMouseOver) {
                    this.overObject.handleMouseOver(evt.pageX, evt.pageY);
                }
                handled = true;
            }

            if (!handled && this.handleMouseMove) {
                this.handleMouseMove(evt.pageX, evt.pageY);
            }
        }
    }
}

Sim.App.prototype.onDocumentMouseDown = function (evt) {
    evt.preventDefault();
    var handled = false;

    var intersected = this.objectFromMouse(evt.pageX, evt.pageY);
    if (intersected.object) {
        if (intersected.object.handleMouseDown) {
            intersected.object.handleMouseDown(evt.pageX, evt.pageY, intersected.point, intersected.normal);
            this.clickedObject = intersected.object;
            handled = true;
        }
    }
    if (!handled && this.handleMouseDown) {
        this.handleMouseDown(evt.pageX, evt.pageY);
    }
}

Sim.App.prototype.onDocumentMouseUp = function (evt) {
    evt.preventDefault();
    var handled = false;

    var intersected = this.objectFromMouse(evt.pageX, evt.pageY);
    if (intersected.object) {
        if (intersected.object.handleMouseUp) {
            intersected.object.handleMouseUp(evt.pageX, evt.pageY, intersected.point, intersected.normal);
            handled = true;
        }
    }

    if (!handled && this.handleMouseUp) {
        this.handleMouseUp(evt.pageX, evt.pageY);
    }

    this.clickedObject = null;
}

Sim.App.prototype.onDocumentMouseScroll = function (evt, delta) {
    evt.preventDefault();

    if (this.handleMouseScroll) {
        this.handleMouseScroll(delta);
    }
}

Sim.App.prototype.objectFromMouse = function (pageX, pageY) {
    var offset = $(this.renderer.domElement).offset();
    var eltx = pageX - offset.left;
    var elty = pageY - offset.top;

    var vpx = (eltx / this.container.offsetWidth) * 2 - 1;
    var vpy = (eltx / this.container.offsetHeight) * 2 + 1;

    var vector = new THREE.Vector3(vpx, vpy, 0.5);

    this.projector.unprojectVector(vector, this.camera);
    var ray = new THREE.Ray(this.camera.position, vector.subSelf(this.camera.position).normalize());

    var intersects = ray.intersectScene(this.scene);

    if (intersects.length > 0) {
        var i = 0;
        while (!intersects[i].object.visible) {
            i++;
        }
        var intersected = intersects[i];
        var mat = new THREE.Matrix4().getInverse(intersected.object.matrixWorld);
        var point = mat.multiplyVector3(intersected.point);

        return (this.findObjectFromIntersected(intersected.object, intersected.point, intersected.face.normal));
    } else {
        return {
            object: null,
            point: null,
            normal: null
        }
    }
}

Sim.App.prototype.findObjectFromIntersected = function (object, point, normal) {
    if (object.data) {
        return {
            object: object.data,
            point,
            normal,
        };
    } else if (object.parent) {
        return this.findObjectFromIntersected(object.parent, point, normal);
    } else {
        return {
            object: null,
            point: null,
            normal: null
        }
    }
}

Sim.App.prototype.onKeyDown = function (evt) {
    evt.preventDefault();
    if (this.handleKeyDown) {
        this.handleKeyDown(evt.keyCode, evt.charCode);
    }
}

Sim.App.prototype.onKeyUp = function (evt) {
    evt.preventDefault();
    if (this.handleKeyUp) {
        this.handleKeyUp(evt.keyCode, evt.charCode);
    }
}

Sim.App.prototype.onKeyPress = function (evt) {
    evt.preventDefault();
    if (this.handleKeyPress) {
        this.handleKeyPress(evt.keyCode, evt.charCode);
    }
}

Sim.App.prototype.onWindowResize = function (evt) {
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
    this.camera.updateProjectionMatrix();
}

Sim.App.prototype.focus = function () {
    if (this.renderer && this.renderer.domElement) {
        this.renderer.domElement.focus();
    }
}
/**
 * 这个类是大部分应用对象的基类。他负责管理某个由应用层自定义的对象，同时还会处理一些基本的Three.js的操作。
 */
Sim.Object = function () {
    Sim.Publisher.call(this);

    this.object3D = null;
    this.children = [];
}

Sim.Object.prototype.setPosition = function (x, y, z) {
    if (this.object3D) {
        this.object3D.position.set(x, y, z);
    }
}

Sim.Object.prototype.setScale = function (x, y, z) {
    if (this.object3D) {
        this.object3D.scale.set(x, y, z);
    }
}

Sim.Object.prototype.setVisible = function (visible) {
    function setVisible(obj, visible) {
        obj.visible = visible;
        var i, len = obj.children.length;
        for (var i = 0; i < len; i++) {
            setVisible(obj.children[i], visible);
        }
    }

    if (this.object3D) {
        setVisible(this.object3D, visible);
    }
}

Sim.Object.prototype.update = function () {
    var i,
        len;
    len = this.children.length;
    for (i = 0; i < len; i++) {
        this.children[i].update();
    }
}

Sim.Object.prototype.setObject3D = function (object3D) {
    object3D.data = this;
    this.object3D = object3D;
}

Sim.Object.prototype.addChild = function (child) {
    this.children.push(child);

    if (child.object3D) {
        this.object3D.add(child.object3D);
    }
}

Sim.Object.prototype.removeChild = function (child) {
    var index = this.children.indexOf(child);
    if (index != -1) {
        this.children.splice(index, 1);
        if (child.object3D) {
            this.object3D.remove(child.object3D);
        }
    }
}

Sim.Object.prototype.getScene = function () {
    var scene = null;
    if (this.object3D) {
        var obj = this.object3D;
        while (obj.parent) {
            obj = obj.parent;
        }
        scene = obj;
    }
    return scene;
}

Sim.Object.prototype.getApp = function () {
    var scene = this.getScene();
    return scene ? scene.data : null;
}


Sim.KeyCodes = {};
Sim.KeyCodes.KEY_LEFT = 37;
Sim.KeyCodes.KEY_UP = 38;
Sim.KeyCodes.KEY_RIGHT = 39;
Sim.KeyCodes.KEY_DOWN = 40;