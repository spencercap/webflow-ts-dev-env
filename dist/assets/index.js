import * as THREE from "three";
import { Ray, Plane, MathUtils, Vector3, Controls, MOUSE, TOUCH, Quaternion, Spherical, Vector2, OrthographicCamera, Mesh, BufferGeometry, Float32BufferAttribute, ShaderMaterial, UniformsUtils, WebGLRenderTarget, HalfFloatType, NoBlending, Clock, Color, AdditiveBlending, MeshBasicMaterial, Loader, FileLoader, Matrix3, ShapeUtils, Box2, Shape, Path, ShapePath, SRGBColorSpace, TrianglesDrawMode, TriangleFanDrawMode, TriangleStripDrawMode, LoaderUtils, LinearSRGBColorSpace, SpotLight, PointLight, DirectionalLight, MeshPhysicalMaterial, Matrix4, InstancedMesh, InstancedBufferAttribute, Object3D, TextureLoader, ImageBitmapLoader, BufferAttribute, InterleavedBuffer, InterleavedBufferAttribute, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, NearestFilter, PointsMaterial, Material, LineBasicMaterial, MeshStandardMaterial, DoubleSide, PropertyBinding, SkinnedMesh, LineSegments, Line, LineLoop, Points, Group, PerspectiveCamera, Skeleton, AnimationClip, Bone, InterpolateLinear, ColorManagement, NearestMipmapNearestFilter, LinearMipmapNearestFilter, NearestMipmapLinearFilter, ClampToEdgeWrapping, MirroredRepeatWrapping, InterpolateDiscrete, FrontSide, Texture, VectorKeyframeTrack, NumberKeyframeTrack, QuaternionKeyframeTrack, Box3, Sphere, Interpolant, ExtrudeGeometry } from "three";
import { GUI } from "dat.gui";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const _changeEvent = { type: "change" };
const _startEvent = { type: "start" };
const _endEvent = { type: "end" };
const _ray = new Ray();
const _plane = new Plane();
const _TILT_LIMIT = Math.cos(70 * MathUtils.DEG2RAD);
const _v = new Vector3();
const _twoPI = 2 * Math.PI;
const _STATE = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
};
const _EPS = 1e-6;
class OrbitControls extends Controls {
  constructor(object, domElement = null) {
    super(object, domElement);
    this.state = _STATE.NONE;
    this.enabled = true;
    this.target = new Vector3();
    this.cursor = new Vector3();
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.minZoom = 0;
    this.maxZoom = Infinity;
    this.minTargetRadius = 0;
    this.maxTargetRadius = Infinity;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.minAzimuthAngle = -Infinity;
    this.maxAzimuthAngle = Infinity;
    this.enableDamping = false;
    this.dampingFactor = 0.05;
    this.enableZoom = true;
    this.zoomSpeed = 1;
    this.enableRotate = true;
    this.rotateSpeed = 1;
    this.enablePan = true;
    this.panSpeed = 1;
    this.screenSpacePanning = true;
    this.keyPanSpeed = 7;
    this.zoomToCursor = false;
    this.autoRotate = false;
    this.autoRotateSpeed = 2;
    this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" };
    this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };
    this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;
    this._domElementKeyEvents = null;
    this._lastPosition = new Vector3();
    this._lastQuaternion = new Quaternion();
    this._lastTargetPosition = new Vector3();
    this._quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
    this._quatInverse = this._quat.clone().invert();
    this._spherical = new Spherical();
    this._sphericalDelta = new Spherical();
    this._scale = 1;
    this._panOffset = new Vector3();
    this._rotateStart = new Vector2();
    this._rotateEnd = new Vector2();
    this._rotateDelta = new Vector2();
    this._panStart = new Vector2();
    this._panEnd = new Vector2();
    this._panDelta = new Vector2();
    this._dollyStart = new Vector2();
    this._dollyEnd = new Vector2();
    this._dollyDelta = new Vector2();
    this._dollyDirection = new Vector3();
    this._mouse = new Vector2();
    this._performCursorZoom = false;
    this._pointers = [];
    this._pointerPositions = {};
    this._controlActive = false;
    this._onPointerMove = onPointerMove.bind(this);
    this._onPointerDown = onPointerDown.bind(this);
    this._onPointerUp = onPointerUp.bind(this);
    this._onContextMenu = onContextMenu.bind(this);
    this._onMouseWheel = onMouseWheel.bind(this);
    this._onKeyDown = onKeyDown.bind(this);
    this._onTouchStart = onTouchStart.bind(this);
    this._onTouchMove = onTouchMove.bind(this);
    this._onMouseDown = onMouseDown.bind(this);
    this._onMouseMove = onMouseMove.bind(this);
    this._interceptControlDown = interceptControlDown.bind(this);
    this._interceptControlUp = interceptControlUp.bind(this);
    if (this.domElement !== null) {
      this.connect();
    }
    this.update();
  }
  connect() {
    this.domElement.addEventListener("pointerdown", this._onPointerDown);
    this.domElement.addEventListener("pointercancel", this._onPointerUp);
    this.domElement.addEventListener("contextmenu", this._onContextMenu);
    this.domElement.addEventListener("wheel", this._onMouseWheel, { passive: false });
    const document2 = this.domElement.getRootNode();
    document2.addEventListener("keydown", this._interceptControlDown, { passive: true, capture: true });
    this.domElement.style.touchAction = "none";
  }
  disconnect() {
    this.domElement.removeEventListener("pointerdown", this._onPointerDown);
    this.domElement.removeEventListener("pointermove", this._onPointerMove);
    this.domElement.removeEventListener("pointerup", this._onPointerUp);
    this.domElement.removeEventListener("pointercancel", this._onPointerUp);
    this.domElement.removeEventListener("wheel", this._onMouseWheel);
    this.domElement.removeEventListener("contextmenu", this._onContextMenu);
    this.stopListenToKeyEvents();
    const document2 = this.domElement.getRootNode();
    document2.removeEventListener("keydown", this._interceptControlDown, { capture: true });
    this.domElement.style.touchAction = "auto";
  }
  dispose() {
    this.disconnect();
  }
  getPolarAngle() {
    return this._spherical.phi;
  }
  getAzimuthalAngle() {
    return this._spherical.theta;
  }
  getDistance() {
    return this.object.position.distanceTo(this.target);
  }
  listenToKeyEvents(domElement) {
    domElement.addEventListener("keydown", this._onKeyDown);
    this._domElementKeyEvents = domElement;
  }
  stopListenToKeyEvents() {
    if (this._domElementKeyEvents !== null) {
      this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown);
      this._domElementKeyEvents = null;
    }
  }
  saveState() {
    this.target0.copy(this.target);
    this.position0.copy(this.object.position);
    this.zoom0 = this.object.zoom;
  }
  reset() {
    this.target.copy(this.target0);
    this.object.position.copy(this.position0);
    this.object.zoom = this.zoom0;
    this.object.updateProjectionMatrix();
    this.dispatchEvent(_changeEvent);
    this.update();
    this.state = _STATE.NONE;
  }
  update(deltaTime = null) {
    const position = this.object.position;
    _v.copy(position).sub(this.target);
    _v.applyQuaternion(this._quat);
    this._spherical.setFromVector3(_v);
    if (this.autoRotate && this.state === _STATE.NONE) {
      this._rotateLeft(this._getAutoRotationAngle(deltaTime));
    }
    if (this.enableDamping) {
      this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor;
      this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor;
    } else {
      this._spherical.theta += this._sphericalDelta.theta;
      this._spherical.phi += this._sphericalDelta.phi;
    }
    let min = this.minAzimuthAngle;
    let max = this.maxAzimuthAngle;
    if (isFinite(min) && isFinite(max)) {
      if (min < -Math.PI) min += _twoPI;
      else if (min > Math.PI) min -= _twoPI;
      if (max < -Math.PI) max += _twoPI;
      else if (max > Math.PI) max -= _twoPI;
      if (min <= max) {
        this._spherical.theta = Math.max(min, Math.min(max, this._spherical.theta));
      } else {
        this._spherical.theta = this._spherical.theta > (min + max) / 2 ? Math.max(min, this._spherical.theta) : Math.min(max, this._spherical.theta);
      }
    }
    this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi));
    this._spherical.makeSafe();
    if (this.enableDamping === true) {
      this.target.addScaledVector(this._panOffset, this.dampingFactor);
    } else {
      this.target.add(this._panOffset);
    }
    this.target.sub(this.cursor);
    this.target.clampLength(this.minTargetRadius, this.maxTargetRadius);
    this.target.add(this.cursor);
    let zoomChanged = false;
    if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) {
      this._spherical.radius = this._clampDistance(this._spherical.radius);
    } else {
      const prevRadius = this._spherical.radius;
      this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale);
      zoomChanged = prevRadius != this._spherical.radius;
    }
    _v.setFromSpherical(this._spherical);
    _v.applyQuaternion(this._quatInverse);
    position.copy(this.target).add(_v);
    this.object.lookAt(this.target);
    if (this.enableDamping === true) {
      this._sphericalDelta.theta *= 1 - this.dampingFactor;
      this._sphericalDelta.phi *= 1 - this.dampingFactor;
      this._panOffset.multiplyScalar(1 - this.dampingFactor);
    } else {
      this._sphericalDelta.set(0, 0, 0);
      this._panOffset.set(0, 0, 0);
    }
    if (this.zoomToCursor && this._performCursorZoom) {
      let newRadius = null;
      if (this.object.isPerspectiveCamera) {
        const prevRadius = _v.length();
        newRadius = this._clampDistance(prevRadius * this._scale);
        const radiusDelta = prevRadius - newRadius;
        this.object.position.addScaledVector(this._dollyDirection, radiusDelta);
        this.object.updateMatrixWorld();
        zoomChanged = !!radiusDelta;
      } else if (this.object.isOrthographicCamera) {
        const mouseBefore = new Vector3(this._mouse.x, this._mouse.y, 0);
        mouseBefore.unproject(this.object);
        const prevZoom = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale));
        this.object.updateProjectionMatrix();
        zoomChanged = prevZoom !== this.object.zoom;
        const mouseAfter = new Vector3(this._mouse.x, this._mouse.y, 0);
        mouseAfter.unproject(this.object);
        this.object.position.sub(mouseAfter).add(mouseBefore);
        this.object.updateMatrixWorld();
        newRadius = _v.length();
      } else {
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.");
        this.zoomToCursor = false;
      }
      if (newRadius !== null) {
        if (this.screenSpacePanning) {
          this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(newRadius).add(this.object.position);
        } else {
          _ray.origin.copy(this.object.position);
          _ray.direction.set(0, 0, -1).transformDirection(this.object.matrix);
          if (Math.abs(this.object.up.dot(_ray.direction)) < _TILT_LIMIT) {
            this.object.lookAt(this.target);
          } else {
            _plane.setFromNormalAndCoplanarPoint(this.object.up, this.target);
            _ray.intersectPlane(_plane, this.target);
          }
        }
      }
    } else if (this.object.isOrthographicCamera) {
      const prevZoom = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale));
      if (prevZoom !== this.object.zoom) {
        this.object.updateProjectionMatrix();
        zoomChanged = true;
      }
    }
    this._scale = 1;
    this._performCursorZoom = false;
    if (zoomChanged || this._lastPosition.distanceToSquared(this.object.position) > _EPS || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > _EPS || this._lastTargetPosition.distanceToSquared(this.target) > _EPS) {
      this.dispatchEvent(_changeEvent);
      this._lastPosition.copy(this.object.position);
      this._lastQuaternion.copy(this.object.quaternion);
      this._lastTargetPosition.copy(this.target);
      return true;
    }
    return false;
  }
  _getAutoRotationAngle(deltaTime) {
    if (deltaTime !== null) {
      return _twoPI / 60 * this.autoRotateSpeed * deltaTime;
    } else {
      return _twoPI / 60 / 60 * this.autoRotateSpeed;
    }
  }
  _getZoomScale(delta) {
    const normalizedDelta = Math.abs(delta * 0.01);
    return Math.pow(0.95, this.zoomSpeed * normalizedDelta);
  }
  _rotateLeft(angle) {
    this._sphericalDelta.theta -= angle;
  }
  _rotateUp(angle) {
    this._sphericalDelta.phi -= angle;
  }
  _panLeft(distance, objectMatrix) {
    _v.setFromMatrixColumn(objectMatrix, 0);
    _v.multiplyScalar(-distance);
    this._panOffset.add(_v);
  }
  _panUp(distance, objectMatrix) {
    if (this.screenSpacePanning === true) {
      _v.setFromMatrixColumn(objectMatrix, 1);
    } else {
      _v.setFromMatrixColumn(objectMatrix, 0);
      _v.crossVectors(this.object.up, _v);
    }
    _v.multiplyScalar(distance);
    this._panOffset.add(_v);
  }
  // deltaX and deltaY are in pixels; right and down are positive
  _pan(deltaX, deltaY) {
    const element = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const position = this.object.position;
      _v.copy(position).sub(this.target);
      let targetDistance = _v.length();
      targetDistance *= Math.tan(this.object.fov / 2 * Math.PI / 180);
      this._panLeft(2 * deltaX * targetDistance / element.clientHeight, this.object.matrix);
      this._panUp(2 * deltaY * targetDistance / element.clientHeight, this.object.matrix);
    } else if (this.object.isOrthographicCamera) {
      this._panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / element.clientWidth, this.object.matrix);
      this._panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / element.clientHeight, this.object.matrix);
    } else {
      console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.");
      this.enablePan = false;
    }
  }
  _dollyOut(dollyScale) {
    if (this.object.isPerspectiveCamera || this.object.isOrthographicCamera) {
      this._scale /= dollyScale;
    } else {
      console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
      this.enableZoom = false;
    }
  }
  _dollyIn(dollyScale) {
    if (this.object.isPerspectiveCamera || this.object.isOrthographicCamera) {
      this._scale *= dollyScale;
    } else {
      console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
      this.enableZoom = false;
    }
  }
  _updateZoomParameters(x, y) {
    if (!this.zoomToCursor) {
      return;
    }
    this._performCursorZoom = true;
    const rect = this.domElement.getBoundingClientRect();
    const dx = x - rect.left;
    const dy = y - rect.top;
    const w = rect.width;
    const h = rect.height;
    this._mouse.x = dx / w * 2 - 1;
    this._mouse.y = -(dy / h) * 2 + 1;
    this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
  }
  _clampDistance(dist) {
    return Math.max(this.minDistance, Math.min(this.maxDistance, dist));
  }
  //
  // event callbacks - update the object state
  //
  _handleMouseDownRotate(event) {
    this._rotateStart.set(event.clientX, event.clientY);
  }
  _handleMouseDownDolly(event) {
    this._updateZoomParameters(event.clientX, event.clientX);
    this._dollyStart.set(event.clientX, event.clientY);
  }
  _handleMouseDownPan(event) {
    this._panStart.set(event.clientX, event.clientY);
  }
  _handleMouseMoveRotate(event) {
    this._rotateEnd.set(event.clientX, event.clientY);
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const element = this.domElement;
    this._rotateLeft(_twoPI * this._rotateDelta.x / element.clientHeight);
    this._rotateUp(_twoPI * this._rotateDelta.y / element.clientHeight);
    this._rotateStart.copy(this._rotateEnd);
    this.update();
  }
  _handleMouseMoveDolly(event) {
    this._dollyEnd.set(event.clientX, event.clientY);
    this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart);
    if (this._dollyDelta.y > 0) {
      this._dollyOut(this._getZoomScale(this._dollyDelta.y));
    } else if (this._dollyDelta.y < 0) {
      this._dollyIn(this._getZoomScale(this._dollyDelta.y));
    }
    this._dollyStart.copy(this._dollyEnd);
    this.update();
  }
  _handleMouseMovePan(event) {
    this._panEnd.set(event.clientX, event.clientY);
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed);
    this._pan(this._panDelta.x, this._panDelta.y);
    this._panStart.copy(this._panEnd);
    this.update();
  }
  _handleMouseWheel(event) {
    this._updateZoomParameters(event.clientX, event.clientY);
    if (event.deltaY < 0) {
      this._dollyIn(this._getZoomScale(event.deltaY));
    } else if (event.deltaY > 0) {
      this._dollyOut(this._getZoomScale(event.deltaY));
    }
    this.update();
  }
  _handleKeyDown(event) {
    let needsUpdate = false;
    switch (event.code) {
      case this.keys.UP:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          this._rotateUp(_twoPI * this.rotateSpeed / this.domElement.clientHeight);
        } else {
          this._pan(0, this.keyPanSpeed);
        }
        needsUpdate = true;
        break;
      case this.keys.BOTTOM:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          this._rotateUp(-_twoPI * this.rotateSpeed / this.domElement.clientHeight);
        } else {
          this._pan(0, -this.keyPanSpeed);
        }
        needsUpdate = true;
        break;
      case this.keys.LEFT:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          this._rotateLeft(_twoPI * this.rotateSpeed / this.domElement.clientHeight);
        } else {
          this._pan(this.keyPanSpeed, 0);
        }
        needsUpdate = true;
        break;
      case this.keys.RIGHT:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          this._rotateLeft(-_twoPI * this.rotateSpeed / this.domElement.clientHeight);
        } else {
          this._pan(-this.keyPanSpeed, 0);
        }
        needsUpdate = true;
        break;
    }
    if (needsUpdate) {
      event.preventDefault();
      this.update();
    }
  }
  _handleTouchStartRotate(event) {
    if (this._pointers.length === 1) {
      this._rotateStart.set(event.pageX, event.pageY);
    } else {
      const position = this._getSecondPointerPosition(event);
      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);
      this._rotateStart.set(x, y);
    }
  }
  _handleTouchStartPan(event) {
    if (this._pointers.length === 1) {
      this._panStart.set(event.pageX, event.pageY);
    } else {
      const position = this._getSecondPointerPosition(event);
      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);
      this._panStart.set(x, y);
    }
  }
  _handleTouchStartDolly(event) {
    const position = this._getSecondPointerPosition(event);
    const dx = event.pageX - position.x;
    const dy = event.pageY - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this._dollyStart.set(0, distance);
  }
  _handleTouchStartDollyPan(event) {
    if (this.enableZoom) this._handleTouchStartDolly(event);
    if (this.enablePan) this._handleTouchStartPan(event);
  }
  _handleTouchStartDollyRotate(event) {
    if (this.enableZoom) this._handleTouchStartDolly(event);
    if (this.enableRotate) this._handleTouchStartRotate(event);
  }
  _handleTouchMoveRotate(event) {
    if (this._pointers.length == 1) {
      this._rotateEnd.set(event.pageX, event.pageY);
    } else {
      const position = this._getSecondPointerPosition(event);
      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);
      this._rotateEnd.set(x, y);
    }
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const element = this.domElement;
    this._rotateLeft(_twoPI * this._rotateDelta.x / element.clientHeight);
    this._rotateUp(_twoPI * this._rotateDelta.y / element.clientHeight);
    this._rotateStart.copy(this._rotateEnd);
  }
  _handleTouchMovePan(event) {
    if (this._pointers.length === 1) {
      this._panEnd.set(event.pageX, event.pageY);
    } else {
      const position = this._getSecondPointerPosition(event);
      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);
      this._panEnd.set(x, y);
    }
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed);
    this._pan(this._panDelta.x, this._panDelta.y);
    this._panStart.copy(this._panEnd);
  }
  _handleTouchMoveDolly(event) {
    const position = this._getSecondPointerPosition(event);
    const dx = event.pageX - position.x;
    const dy = event.pageY - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this._dollyEnd.set(0, distance);
    this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed));
    this._dollyOut(this._dollyDelta.y);
    this._dollyStart.copy(this._dollyEnd);
    const centerX = (event.pageX + position.x) * 0.5;
    const centerY = (event.pageY + position.y) * 0.5;
    this._updateZoomParameters(centerX, centerY);
  }
  _handleTouchMoveDollyPan(event) {
    if (this.enableZoom) this._handleTouchMoveDolly(event);
    if (this.enablePan) this._handleTouchMovePan(event);
  }
  _handleTouchMoveDollyRotate(event) {
    if (this.enableZoom) this._handleTouchMoveDolly(event);
    if (this.enableRotate) this._handleTouchMoveRotate(event);
  }
  // pointers
  _addPointer(event) {
    this._pointers.push(event.pointerId);
  }
  _removePointer(event) {
    delete this._pointerPositions[event.pointerId];
    for (let i = 0; i < this._pointers.length; i++) {
      if (this._pointers[i] == event.pointerId) {
        this._pointers.splice(i, 1);
        return;
      }
    }
  }
  _isTrackingPointer(event) {
    for (let i = 0; i < this._pointers.length; i++) {
      if (this._pointers[i] == event.pointerId) return true;
    }
    return false;
  }
  _trackPointer(event) {
    let position = this._pointerPositions[event.pointerId];
    if (position === void 0) {
      position = new Vector2();
      this._pointerPositions[event.pointerId] = position;
    }
    position.set(event.pageX, event.pageY);
  }
  _getSecondPointerPosition(event) {
    const pointerId = event.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[pointerId];
  }
  //
  _customWheelEvent(event) {
    const mode = event.deltaMode;
    const newEvent = {
      clientX: event.clientX,
      clientY: event.clientY,
      deltaY: event.deltaY
    };
    switch (mode) {
      case 1:
        newEvent.deltaY *= 16;
        break;
      case 2:
        newEvent.deltaY *= 100;
        break;
    }
    if (event.ctrlKey && !this._controlActive) {
      newEvent.deltaY *= 10;
    }
    return newEvent;
  }
}
function onPointerDown(event) {
  if (this.enabled === false) return;
  if (this._pointers.length === 0) {
    this.domElement.setPointerCapture(event.pointerId);
    this.domElement.addEventListener("pointermove", this._onPointerMove);
    this.domElement.addEventListener("pointerup", this._onPointerUp);
  }
  if (this._isTrackingPointer(event)) return;
  this._addPointer(event);
  if (event.pointerType === "touch") {
    this._onTouchStart(event);
  } else {
    this._onMouseDown(event);
  }
}
function onPointerMove(event) {
  if (this.enabled === false) return;
  if (event.pointerType === "touch") {
    this._onTouchMove(event);
  } else {
    this._onMouseMove(event);
  }
}
function onPointerUp(event) {
  this._removePointer(event);
  switch (this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(event.pointerId);
      this.domElement.removeEventListener("pointermove", this._onPointerMove);
      this.domElement.removeEventListener("pointerup", this._onPointerUp);
      this.dispatchEvent(_endEvent);
      this.state = _STATE.NONE;
      break;
    case 1:
      const pointerId = this._pointers[0];
      const position = this._pointerPositions[pointerId];
      this._onTouchStart({ pointerId, pageX: position.x, pageY: position.y });
      break;
  }
}
function onMouseDown(event) {
  let mouseAction;
  switch (event.button) {
    case 0:
      mouseAction = this.mouseButtons.LEFT;
      break;
    case 1:
      mouseAction = this.mouseButtons.MIDDLE;
      break;
    case 2:
      mouseAction = this.mouseButtons.RIGHT;
      break;
    default:
      mouseAction = -1;
  }
  switch (mouseAction) {
    case MOUSE.DOLLY:
      if (this.enableZoom === false) return;
      this._handleMouseDownDolly(event);
      this.state = _STATE.DOLLY;
      break;
    case MOUSE.ROTATE:
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        if (this.enablePan === false) return;
        this._handleMouseDownPan(event);
        this.state = _STATE.PAN;
      } else {
        if (this.enableRotate === false) return;
        this._handleMouseDownRotate(event);
        this.state = _STATE.ROTATE;
      }
      break;
    case MOUSE.PAN:
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        if (this.enableRotate === false) return;
        this._handleMouseDownRotate(event);
        this.state = _STATE.ROTATE;
      } else {
        if (this.enablePan === false) return;
        this._handleMouseDownPan(event);
        this.state = _STATE.PAN;
      }
      break;
    default:
      this.state = _STATE.NONE;
  }
  if (this.state !== _STATE.NONE) {
    this.dispatchEvent(_startEvent);
  }
}
function onMouseMove(event) {
  switch (this.state) {
    case _STATE.ROTATE:
      if (this.enableRotate === false) return;
      this._handleMouseMoveRotate(event);
      break;
    case _STATE.DOLLY:
      if (this.enableZoom === false) return;
      this._handleMouseMoveDolly(event);
      break;
    case _STATE.PAN:
      if (this.enablePan === false) return;
      this._handleMouseMovePan(event);
      break;
  }
}
function onMouseWheel(event) {
  if (this.enabled === false || this.enableZoom === false || this.state !== _STATE.NONE) return;
  event.preventDefault();
  this.dispatchEvent(_startEvent);
  this._handleMouseWheel(this._customWheelEvent(event));
  this.dispatchEvent(_endEvent);
}
function onKeyDown(event) {
  if (this.enabled === false || this.enablePan === false) return;
  this._handleKeyDown(event);
}
function onTouchStart(event) {
  this._trackPointer(event);
  switch (this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case TOUCH.ROTATE:
          if (this.enableRotate === false) return;
          this._handleTouchStartRotate(event);
          this.state = _STATE.TOUCH_ROTATE;
          break;
        case TOUCH.PAN:
          if (this.enablePan === false) return;
          this._handleTouchStartPan(event);
          this.state = _STATE.TOUCH_PAN;
          break;
        default:
          this.state = _STATE.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case TOUCH.DOLLY_PAN:
          if (this.enableZoom === false && this.enablePan === false) return;
          this._handleTouchStartDollyPan(event);
          this.state = _STATE.TOUCH_DOLLY_PAN;
          break;
        case TOUCH.DOLLY_ROTATE:
          if (this.enableZoom === false && this.enableRotate === false) return;
          this._handleTouchStartDollyRotate(event);
          this.state = _STATE.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = _STATE.NONE;
      }
      break;
    default:
      this.state = _STATE.NONE;
  }
  if (this.state !== _STATE.NONE) {
    this.dispatchEvent(_startEvent);
  }
}
function onTouchMove(event) {
  this._trackPointer(event);
  switch (this.state) {
    case _STATE.TOUCH_ROTATE:
      if (this.enableRotate === false) return;
      this._handleTouchMoveRotate(event);
      this.update();
      break;
    case _STATE.TOUCH_PAN:
      if (this.enablePan === false) return;
      this._handleTouchMovePan(event);
      this.update();
      break;
    case _STATE.TOUCH_DOLLY_PAN:
      if (this.enableZoom === false && this.enablePan === false) return;
      this._handleTouchMoveDollyPan(event);
      this.update();
      break;
    case _STATE.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === false && this.enableRotate === false) return;
      this._handleTouchMoveDollyRotate(event);
      this.update();
      break;
    default:
      this.state = _STATE.NONE;
  }
}
function onContextMenu(event) {
  if (this.enabled === false) return;
  event.preventDefault();
}
function interceptControlDown(event) {
  if (event.key === "Control") {
    this._controlActive = true;
    const document2 = this.domElement.getRootNode();
    document2.addEventListener("keyup", this._interceptControlUp, { passive: true, capture: true });
  }
}
function interceptControlUp(event) {
  if (event.key === "Control") {
    this._controlActive = false;
    const document2 = this.domElement.getRootNode();
    document2.removeEventListener("keyup", this._interceptControlUp, { passive: true, capture: true });
  }
}
const CopyShader = {
  name: "CopyShader",
  uniforms: {
    "tDiffuse": { value: null },
    "opacity": { value: 1 }
  },
  vertexShader: (
    /* glsl */
    `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`
  ),
  fragmentShader: (
    /* glsl */
    `

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`
  )
};
class Pass {
  constructor() {
    this.isPass = true;
    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;
    this.renderToScreen = false;
  }
  setSize() {
  }
  render() {
    console.error("THREE.Pass: .render() must be implemented in derived pass.");
  }
  dispose() {
  }
}
const _camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
class FullscreenTriangleGeometry extends BufferGeometry {
  constructor() {
    super();
    this.setAttribute("position", new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
    this.setAttribute("uv", new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
  }
}
const _geometry = new FullscreenTriangleGeometry();
class FullScreenQuad {
  constructor(material2) {
    this._mesh = new Mesh(_geometry, material2);
  }
  dispose() {
    this._mesh.geometry.dispose();
  }
  render(renderer2) {
    renderer2.render(this._mesh, _camera);
  }
  get material() {
    return this._mesh.material;
  }
  set material(value) {
    this._mesh.material = value;
  }
}
class ShaderPass extends Pass {
  constructor(shader, textureID) {
    super();
    this.textureID = textureID !== void 0 ? textureID : "tDiffuse";
    if (shader instanceof ShaderMaterial) {
      this.uniforms = shader.uniforms;
      this.material = shader;
    } else if (shader) {
      this.uniforms = UniformsUtils.clone(shader.uniforms);
      this.material = new ShaderMaterial({
        name: shader.name !== void 0 ? shader.name : "unspecified",
        defines: Object.assign({}, shader.defines),
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
      });
    }
    this.fsQuad = new FullScreenQuad(this.material);
  }
  render(renderer2, writeBuffer, readBuffer) {
    if (this.uniforms[this.textureID]) {
      this.uniforms[this.textureID].value = readBuffer.texture;
    }
    this.fsQuad.material = this.material;
    if (this.renderToScreen) {
      renderer2.setRenderTarget(null);
      this.fsQuad.render(renderer2);
    } else {
      renderer2.setRenderTarget(writeBuffer);
      if (this.clear) renderer2.clear(renderer2.autoClearColor, renderer2.autoClearDepth, renderer2.autoClearStencil);
      this.fsQuad.render(renderer2);
    }
  }
  dispose() {
    this.material.dispose();
    this.fsQuad.dispose();
  }
}
class MaskPass extends Pass {
  constructor(scene2, camera2) {
    super();
    this.scene = scene2;
    this.camera = camera2;
    this.clear = true;
    this.needsSwap = false;
    this.inverse = false;
  }
  render(renderer2, writeBuffer, readBuffer) {
    const context = renderer2.getContext();
    const state = renderer2.state;
    state.buffers.color.setMask(false);
    state.buffers.depth.setMask(false);
    state.buffers.color.setLocked(true);
    state.buffers.depth.setLocked(true);
    let writeValue, clearValue;
    if (this.inverse) {
      writeValue = 0;
      clearValue = 1;
    } else {
      writeValue = 1;
      clearValue = 0;
    }
    state.buffers.stencil.setTest(true);
    state.buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
    state.buffers.stencil.setFunc(context.ALWAYS, writeValue, 4294967295);
    state.buffers.stencil.setClear(clearValue);
    state.buffers.stencil.setLocked(true);
    renderer2.setRenderTarget(readBuffer);
    if (this.clear) renderer2.clear();
    renderer2.render(this.scene, this.camera);
    renderer2.setRenderTarget(writeBuffer);
    if (this.clear) renderer2.clear();
    renderer2.render(this.scene, this.camera);
    state.buffers.color.setLocked(false);
    state.buffers.depth.setLocked(false);
    state.buffers.color.setMask(true);
    state.buffers.depth.setMask(true);
    state.buffers.stencil.setLocked(false);
    state.buffers.stencil.setFunc(context.EQUAL, 1, 4294967295);
    state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
    state.buffers.stencil.setLocked(true);
  }
}
class ClearMaskPass extends Pass {
  constructor() {
    super();
    this.needsSwap = false;
  }
  render(renderer2) {
    renderer2.state.buffers.stencil.setLocked(false);
    renderer2.state.buffers.stencil.setTest(false);
  }
}
class EffectComposer {
  constructor(renderer2, renderTarget) {
    this.renderer = renderer2;
    this._pixelRatio = renderer2.getPixelRatio();
    if (renderTarget === void 0) {
      const size = renderer2.getSize(new Vector2());
      this._width = size.width;
      this._height = size.height;
      renderTarget = new WebGLRenderTarget(this._width * this._pixelRatio, this._height * this._pixelRatio, { type: HalfFloatType });
      renderTarget.texture.name = "EffectComposer.rt1";
    } else {
      this._width = renderTarget.width;
      this._height = renderTarget.height;
    }
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.renderTarget2.texture.name = "EffectComposer.rt2";
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
    this.renderToScreen = true;
    this.passes = [];
    this.copyPass = new ShaderPass(CopyShader);
    this.copyPass.material.blending = NoBlending;
    this.clock = new Clock();
  }
  swapBuffers() {
    const tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  }
  addPass(pass) {
    this.passes.push(pass);
    pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  insertPass(pass, index) {
    this.passes.splice(index, 0, pass);
    pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  removePass(pass) {
    const index = this.passes.indexOf(pass);
    if (index !== -1) {
      this.passes.splice(index, 1);
    }
  }
  isLastEnabledPass(passIndex) {
    for (let i = passIndex + 1; i < this.passes.length; i++) {
      if (this.passes[i].enabled) {
        return false;
      }
    }
    return true;
  }
  render(deltaTime) {
    if (deltaTime === void 0) {
      deltaTime = this.clock.getDelta();
    }
    const currentRenderTarget = this.renderer.getRenderTarget();
    let maskActive = false;
    for (let i = 0, il = this.passes.length; i < il; i++) {
      const pass = this.passes[i];
      if (pass.enabled === false) continue;
      pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass(i);
      pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive);
      if (pass.needsSwap) {
        if (maskActive) {
          const context = this.renderer.getContext();
          const stencil = this.renderer.state.buffers.stencil;
          stencil.setFunc(context.NOTEQUAL, 1, 4294967295);
          this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime);
          stencil.setFunc(context.EQUAL, 1, 4294967295);
        }
        this.swapBuffers();
      }
      if (MaskPass !== void 0) {
        if (pass instanceof MaskPass) {
          maskActive = true;
        } else if (pass instanceof ClearMaskPass) {
          maskActive = false;
        }
      }
    }
    this.renderer.setRenderTarget(currentRenderTarget);
  }
  reset(renderTarget) {
    if (renderTarget === void 0) {
      const size = this.renderer.getSize(new Vector2());
      this._pixelRatio = this.renderer.getPixelRatio();
      this._width = size.width;
      this._height = size.height;
      renderTarget = this.renderTarget1.clone();
      renderTarget.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }
    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
  }
  setSize(width, height) {
    this._width = width;
    this._height = height;
    const effectiveWidth = this._width * this._pixelRatio;
    const effectiveHeight = this._height * this._pixelRatio;
    this.renderTarget1.setSize(effectiveWidth, effectiveHeight);
    this.renderTarget2.setSize(effectiveWidth, effectiveHeight);
    for (let i = 0; i < this.passes.length; i++) {
      this.passes[i].setSize(effectiveWidth, effectiveHeight);
    }
  }
  setPixelRatio(pixelRatio) {
    this._pixelRatio = pixelRatio;
    this.setSize(this._width, this._height);
  }
  dispose() {
    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.copyPass.dispose();
  }
}
class RenderPass extends Pass {
  constructor(scene2, camera2, overrideMaterial = null, clearColor = null, clearAlpha = null) {
    super();
    this.scene = scene2;
    this.camera = camera2;
    this.overrideMaterial = overrideMaterial;
    this.clearColor = clearColor;
    this.clearAlpha = clearAlpha;
    this.clear = true;
    this.clearDepth = false;
    this.needsSwap = false;
    this._oldClearColor = new Color();
  }
  render(renderer2, writeBuffer, readBuffer) {
    const oldAutoClear = renderer2.autoClear;
    renderer2.autoClear = false;
    let oldClearAlpha, oldOverrideMaterial;
    if (this.overrideMaterial !== null) {
      oldOverrideMaterial = this.scene.overrideMaterial;
      this.scene.overrideMaterial = this.overrideMaterial;
    }
    if (this.clearColor !== null) {
      renderer2.getClearColor(this._oldClearColor);
      renderer2.setClearColor(this.clearColor, renderer2.getClearAlpha());
    }
    if (this.clearAlpha !== null) {
      oldClearAlpha = renderer2.getClearAlpha();
      renderer2.setClearAlpha(this.clearAlpha);
    }
    if (this.clearDepth == true) {
      renderer2.clearDepth();
    }
    renderer2.setRenderTarget(this.renderToScreen ? null : readBuffer);
    if (this.clear === true) {
      renderer2.clear(renderer2.autoClearColor, renderer2.autoClearDepth, renderer2.autoClearStencil);
    }
    renderer2.render(this.scene, this.camera);
    if (this.clearColor !== null) {
      renderer2.setClearColor(this._oldClearColor);
    }
    if (this.clearAlpha !== null) {
      renderer2.setClearAlpha(oldClearAlpha);
    }
    if (this.overrideMaterial !== null) {
      this.scene.overrideMaterial = oldOverrideMaterial;
    }
    renderer2.autoClear = oldAutoClear;
  }
}
const LuminosityHighPassShader = {
  name: "LuminosityHighPassShader",
  shaderID: "luminosityHighPass",
  uniforms: {
    "tDiffuse": { value: null },
    "luminosityThreshold": { value: 1 },
    "smoothWidth": { value: 1 },
    "defaultColor": { value: new Color(0) },
    "defaultOpacity": { value: 0 }
  },
  vertexShader: (
    /* glsl */
    `

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`
  ),
  fragmentShader: (
    /* glsl */
    `

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`
  )
};
class UnrealBloomPass extends Pass {
  constructor(resolution, strength, radius, threshold) {
    super();
    this.strength = strength !== void 0 ? strength : 1;
    this.radius = radius;
    this.threshold = threshold;
    this.resolution = resolution !== void 0 ? new Vector2(resolution.x, resolution.y) : new Vector2(256, 256);
    this.clearColor = new Color(0, 0, 0);
    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    this.nMips = 5;
    let resx = Math.round(this.resolution.x / 2);
    let resy = Math.round(this.resolution.y / 2);
    this.renderTargetBright = new WebGLRenderTarget(resx, resy, { type: HalfFloatType });
    this.renderTargetBright.texture.name = "UnrealBloomPass.bright";
    this.renderTargetBright.texture.generateMipmaps = false;
    for (let i = 0; i < this.nMips; i++) {
      const renderTargetHorizontal = new WebGLRenderTarget(resx, resy, { type: HalfFloatType });
      renderTargetHorizontal.texture.name = "UnrealBloomPass.h" + i;
      renderTargetHorizontal.texture.generateMipmaps = false;
      this.renderTargetsHorizontal.push(renderTargetHorizontal);
      const renderTargetVertical = new WebGLRenderTarget(resx, resy, { type: HalfFloatType });
      renderTargetVertical.texture.name = "UnrealBloomPass.v" + i;
      renderTargetVertical.texture.generateMipmaps = false;
      this.renderTargetsVertical.push(renderTargetVertical);
      resx = Math.round(resx / 2);
      resy = Math.round(resy / 2);
    }
    const highPassShader = LuminosityHighPassShader;
    this.highPassUniforms = UniformsUtils.clone(highPassShader.uniforms);
    this.highPassUniforms["luminosityThreshold"].value = threshold;
    this.highPassUniforms["smoothWidth"].value = 0.01;
    this.materialHighPassFilter = new ShaderMaterial({
      uniforms: this.highPassUniforms,
      vertexShader: highPassShader.vertexShader,
      fragmentShader: highPassShader.fragmentShader
    });
    this.separableBlurMaterials = [];
    const kernelSizeArray = [3, 5, 7, 9, 11];
    resx = Math.round(this.resolution.x / 2);
    resy = Math.round(this.resolution.y / 2);
    for (let i = 0; i < this.nMips; i++) {
      this.separableBlurMaterials.push(this.getSeperableBlurMaterial(kernelSizeArray[i]));
      this.separableBlurMaterials[i].uniforms["invSize"].value = new Vector2(1 / resx, 1 / resy);
      resx = Math.round(resx / 2);
      resy = Math.round(resy / 2);
    }
    this.compositeMaterial = this.getCompositeMaterial(this.nMips);
    this.compositeMaterial.uniforms["blurTexture1"].value = this.renderTargetsVertical[0].texture;
    this.compositeMaterial.uniforms["blurTexture2"].value = this.renderTargetsVertical[1].texture;
    this.compositeMaterial.uniforms["blurTexture3"].value = this.renderTargetsVertical[2].texture;
    this.compositeMaterial.uniforms["blurTexture4"].value = this.renderTargetsVertical[3].texture;
    this.compositeMaterial.uniforms["blurTexture5"].value = this.renderTargetsVertical[4].texture;
    this.compositeMaterial.uniforms["bloomStrength"].value = strength;
    this.compositeMaterial.uniforms["bloomRadius"].value = 0.1;
    const bloomFactors = [1, 0.8, 0.6, 0.4, 0.2];
    this.compositeMaterial.uniforms["bloomFactors"].value = bloomFactors;
    this.bloomTintColors = [new Vector3(1, 1, 1), new Vector3(1, 1, 1), new Vector3(1, 1, 1), new Vector3(1, 1, 1), new Vector3(1, 1, 1)];
    this.compositeMaterial.uniforms["bloomTintColors"].value = this.bloomTintColors;
    const copyShader = CopyShader;
    this.copyUniforms = UniformsUtils.clone(copyShader.uniforms);
    this.blendMaterial = new ShaderMaterial({
      uniforms: this.copyUniforms,
      vertexShader: copyShader.vertexShader,
      fragmentShader: copyShader.fragmentShader,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
    this.enabled = true;
    this.needsSwap = false;
    this._oldClearColor = new Color();
    this.oldClearAlpha = 1;
    this.basic = new MeshBasicMaterial();
    this.fsQuad = new FullScreenQuad(null);
  }
  dispose() {
    for (let i = 0; i < this.renderTargetsHorizontal.length; i++) {
      this.renderTargetsHorizontal[i].dispose();
    }
    for (let i = 0; i < this.renderTargetsVertical.length; i++) {
      this.renderTargetsVertical[i].dispose();
    }
    this.renderTargetBright.dispose();
    for (let i = 0; i < this.separableBlurMaterials.length; i++) {
      this.separableBlurMaterials[i].dispose();
    }
    this.compositeMaterial.dispose();
    this.blendMaterial.dispose();
    this.basic.dispose();
    this.fsQuad.dispose();
  }
  setSize(width, height) {
    let resx = Math.round(width / 2);
    let resy = Math.round(height / 2);
    this.renderTargetBright.setSize(resx, resy);
    for (let i = 0; i < this.nMips; i++) {
      this.renderTargetsHorizontal[i].setSize(resx, resy);
      this.renderTargetsVertical[i].setSize(resx, resy);
      this.separableBlurMaterials[i].uniforms["invSize"].value = new Vector2(1 / resx, 1 / resy);
      resx = Math.round(resx / 2);
      resy = Math.round(resy / 2);
    }
  }
  render(renderer2, writeBuffer, readBuffer, deltaTime, maskActive) {
    renderer2.getClearColor(this._oldClearColor);
    this.oldClearAlpha = renderer2.getClearAlpha();
    const oldAutoClear = renderer2.autoClear;
    renderer2.autoClear = false;
    renderer2.setClearColor(this.clearColor, 0);
    if (maskActive) renderer2.state.buffers.stencil.setTest(false);
    if (this.renderToScreen) {
      this.fsQuad.material = this.basic;
      this.basic.map = readBuffer.texture;
      renderer2.setRenderTarget(null);
      renderer2.clear();
      this.fsQuad.render(renderer2);
    }
    this.highPassUniforms["tDiffuse"].value = readBuffer.texture;
    this.highPassUniforms["luminosityThreshold"].value = this.threshold;
    this.fsQuad.material = this.materialHighPassFilter;
    renderer2.setRenderTarget(this.renderTargetBright);
    renderer2.clear();
    this.fsQuad.render(renderer2);
    let inputRenderTarget = this.renderTargetBright;
    for (let i = 0; i < this.nMips; i++) {
      this.fsQuad.material = this.separableBlurMaterials[i];
      this.separableBlurMaterials[i].uniforms["colorTexture"].value = inputRenderTarget.texture;
      this.separableBlurMaterials[i].uniforms["direction"].value = UnrealBloomPass.BlurDirectionX;
      renderer2.setRenderTarget(this.renderTargetsHorizontal[i]);
      renderer2.clear();
      this.fsQuad.render(renderer2);
      this.separableBlurMaterials[i].uniforms["colorTexture"].value = this.renderTargetsHorizontal[i].texture;
      this.separableBlurMaterials[i].uniforms["direction"].value = UnrealBloomPass.BlurDirectionY;
      renderer2.setRenderTarget(this.renderTargetsVertical[i]);
      renderer2.clear();
      this.fsQuad.render(renderer2);
      inputRenderTarget = this.renderTargetsVertical[i];
    }
    this.fsQuad.material = this.compositeMaterial;
    this.compositeMaterial.uniforms["bloomStrength"].value = this.strength;
    this.compositeMaterial.uniforms["bloomRadius"].value = this.radius;
    this.compositeMaterial.uniforms["bloomTintColors"].value = this.bloomTintColors;
    renderer2.setRenderTarget(this.renderTargetsHorizontal[0]);
    renderer2.clear();
    this.fsQuad.render(renderer2);
    this.fsQuad.material = this.blendMaterial;
    this.copyUniforms["tDiffuse"].value = this.renderTargetsHorizontal[0].texture;
    if (maskActive) renderer2.state.buffers.stencil.setTest(true);
    if (this.renderToScreen) {
      renderer2.setRenderTarget(null);
      this.fsQuad.render(renderer2);
    } else {
      renderer2.setRenderTarget(readBuffer);
      this.fsQuad.render(renderer2);
    }
    renderer2.setClearColor(this._oldClearColor, this.oldClearAlpha);
    renderer2.autoClear = oldAutoClear;
  }
  getSeperableBlurMaterial(kernelRadius) {
    const coefficients = [];
    for (let i = 0; i < kernelRadius; i++) {
      coefficients.push(0.39894 * Math.exp(-0.5 * i * i / (kernelRadius * kernelRadius)) / kernelRadius);
    }
    return new ShaderMaterial({
      defines: {
        "KERNEL_RADIUS": kernelRadius
      },
      uniforms: {
        "colorTexture": { value: null },
        "invSize": { value: new Vector2(0.5, 0.5) },
        // inverse texture size
        "direction": { value: new Vector2(0.5, 0.5) },
        "gaussianCoefficients": { value: coefficients }
        // precomputed Gaussian coefficients
      },
      vertexShader: `varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`
    });
  }
  getCompositeMaterial(nMips) {
    return new ShaderMaterial({
      defines: {
        "NUM_MIPS": nMips
      },
      uniforms: {
        "blurTexture1": { value: null },
        "blurTexture2": { value: null },
        "blurTexture3": { value: null },
        "blurTexture4": { value: null },
        "blurTexture5": { value: null },
        "bloomStrength": { value: 1 },
        "bloomFactors": { value: null },
        "bloomTintColors": { value: null },
        "bloomRadius": { value: 0 }
      },
      vertexShader: `varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`
    });
  }
}
UnrealBloomPass.BlurDirectionX = new Vector2(1, 0);
UnrealBloomPass.BlurDirectionY = new Vector2(0, 1);
const COLOR_SPACE_SVG = SRGBColorSpace;
class SVGLoader extends Loader {
  constructor(manager) {
    super(manager);
    this.defaultDPI = 90;
    this.defaultUnit = "px";
  }
  load(url, onLoad, onProgress, onError) {
    const scope = this;
    const loader2 = new FileLoader(scope.manager);
    loader2.setPath(scope.path);
    loader2.setRequestHeader(scope.requestHeader);
    loader2.setWithCredentials(scope.withCredentials);
    loader2.load(url, function(text) {
      try {
        onLoad(scope.parse(text));
      } catch (e) {
        if (onError) {
          onError(e);
        } else {
          console.error(e);
        }
        scope.manager.itemError(url);
      }
    }, onProgress, onError);
  }
  parse(text) {
    const scope = this;
    function parseNode(node, style) {
      if (node.nodeType !== 1) return;
      const transform = getNodeTransform(node);
      let isDefsNode = false;
      let path = null;
      switch (node.nodeName) {
        case "svg":
          style = parseStyle(node, style);
          break;
        case "style":
          parseCSSStylesheet(node);
          break;
        case "g":
          style = parseStyle(node, style);
          break;
        case "path":
          style = parseStyle(node, style);
          if (node.hasAttribute("d")) path = parsePathNode(node);
          break;
        case "rect":
          style = parseStyle(node, style);
          path = parseRectNode(node);
          break;
        case "polygon":
          style = parseStyle(node, style);
          path = parsePolygonNode(node);
          break;
        case "polyline":
          style = parseStyle(node, style);
          path = parsePolylineNode(node);
          break;
        case "circle":
          style = parseStyle(node, style);
          path = parseCircleNode(node);
          break;
        case "ellipse":
          style = parseStyle(node, style);
          path = parseEllipseNode(node);
          break;
        case "line":
          style = parseStyle(node, style);
          path = parseLineNode(node);
          break;
        case "defs":
          isDefsNode = true;
          break;
        case "use":
          style = parseStyle(node, style);
          const href = node.getAttributeNS("http://www.w3.org/1999/xlink", "href") || "";
          const usedNodeId = href.substring(1);
          const usedNode = node.viewportElement.getElementById(usedNodeId);
          if (usedNode) {
            parseNode(usedNode, style);
          } else {
            console.warn("SVGLoader: 'use node' references non-existent node id: " + usedNodeId);
          }
          break;
      }
      if (path) {
        if (style.fill !== void 0 && style.fill !== "none") {
          path.color.setStyle(style.fill, COLOR_SPACE_SVG);
        }
        transformPath(path, currentTransform);
        paths.push(path);
        path.userData = { node, style };
      }
      const childNodes = node.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        const node2 = childNodes[i];
        if (isDefsNode && node2.nodeName !== "style" && node2.nodeName !== "defs") {
          continue;
        }
        parseNode(node2, style);
      }
      if (transform) {
        transformStack.pop();
        if (transformStack.length > 0) {
          currentTransform.copy(transformStack[transformStack.length - 1]);
        } else {
          currentTransform.identity();
        }
      }
    }
    function parsePathNode(node) {
      const path = new ShapePath();
      const point = new Vector2();
      const control = new Vector2();
      const firstPoint = new Vector2();
      let isFirstPoint = true;
      let doSetFirstPoint = false;
      const d = node.getAttribute("d");
      if (d === "" || d === "none") return null;
      const commands = d.match(/[a-df-z][^a-df-z]*/ig);
      for (let i = 0, l = commands.length; i < l; i++) {
        const command = commands[i];
        const type = command.charAt(0);
        const data2 = command.slice(1).trim();
        if (isFirstPoint === true) {
          doSetFirstPoint = true;
          isFirstPoint = false;
        }
        let numbers;
        switch (type) {
          case "M":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 2) {
              point.x = numbers[j + 0];
              point.y = numbers[j + 1];
              control.x = point.x;
              control.y = point.y;
              if (j === 0) {
                path.moveTo(point.x, point.y);
              } else {
                path.lineTo(point.x, point.y);
              }
              if (j === 0) firstPoint.copy(point);
            }
            break;
          case "H":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j++) {
              point.x = numbers[j];
              control.x = point.x;
              control.y = point.y;
              path.lineTo(point.x, point.y);
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "V":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j++) {
              point.y = numbers[j];
              control.x = point.x;
              control.y = point.y;
              path.lineTo(point.x, point.y);
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "L":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 2) {
              point.x = numbers[j + 0];
              point.y = numbers[j + 1];
              control.x = point.x;
              control.y = point.y;
              path.lineTo(point.x, point.y);
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "C":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 6) {
              path.bezierCurveTo(
                numbers[j + 0],
                numbers[j + 1],
                numbers[j + 2],
                numbers[j + 3],
                numbers[j + 4],
                numbers[j + 5]
              );
              control.x = numbers[j + 2];
              control.y = numbers[j + 3];
              point.x = numbers[j + 4];
              point.y = numbers[j + 5];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "S":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 4) {
              path.bezierCurveTo(
                getReflection(point.x, control.x),
                getReflection(point.y, control.y),
                numbers[j + 0],
                numbers[j + 1],
                numbers[j + 2],
                numbers[j + 3]
              );
              control.x = numbers[j + 0];
              control.y = numbers[j + 1];
              point.x = numbers[j + 2];
              point.y = numbers[j + 3];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "Q":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 4) {
              path.quadraticCurveTo(
                numbers[j + 0],
                numbers[j + 1],
                numbers[j + 2],
                numbers[j + 3]
              );
              control.x = numbers[j + 0];
              control.y = numbers[j + 1];
              point.x = numbers[j + 2];
              point.y = numbers[j + 3];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "T":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 2) {
              const rx = getReflection(point.x, control.x);
              const ry = getReflection(point.y, control.y);
              path.quadraticCurveTo(
                rx,
                ry,
                numbers[j + 0],
                numbers[j + 1]
              );
              control.x = rx;
              control.y = ry;
              point.x = numbers[j + 0];
              point.y = numbers[j + 1];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "A":
            numbers = parseFloats(data2, [3, 4], 7);
            for (let j = 0, jl = numbers.length; j < jl; j += 7) {
              if (numbers[j + 5] == point.x && numbers[j + 6] == point.y) continue;
              const start = point.clone();
              point.x = numbers[j + 5];
              point.y = numbers[j + 6];
              control.x = point.x;
              control.y = point.y;
              parseArcCommand(
                path,
                numbers[j],
                numbers[j + 1],
                numbers[j + 2],
                numbers[j + 3],
                numbers[j + 4],
                start,
                point
              );
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "m":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 2) {
              point.x += numbers[j + 0];
              point.y += numbers[j + 1];
              control.x = point.x;
              control.y = point.y;
              if (j === 0) {
                path.moveTo(point.x, point.y);
              } else {
                path.lineTo(point.x, point.y);
              }
              if (j === 0) firstPoint.copy(point);
            }
            break;
          case "h":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j++) {
              point.x += numbers[j];
              control.x = point.x;
              control.y = point.y;
              path.lineTo(point.x, point.y);
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "v":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j++) {
              point.y += numbers[j];
              control.x = point.x;
              control.y = point.y;
              path.lineTo(point.x, point.y);
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "l":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 2) {
              point.x += numbers[j + 0];
              point.y += numbers[j + 1];
              control.x = point.x;
              control.y = point.y;
              path.lineTo(point.x, point.y);
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "c":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 6) {
              path.bezierCurveTo(
                point.x + numbers[j + 0],
                point.y + numbers[j + 1],
                point.x + numbers[j + 2],
                point.y + numbers[j + 3],
                point.x + numbers[j + 4],
                point.y + numbers[j + 5]
              );
              control.x = point.x + numbers[j + 2];
              control.y = point.y + numbers[j + 3];
              point.x += numbers[j + 4];
              point.y += numbers[j + 5];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "s":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 4) {
              path.bezierCurveTo(
                getReflection(point.x, control.x),
                getReflection(point.y, control.y),
                point.x + numbers[j + 0],
                point.y + numbers[j + 1],
                point.x + numbers[j + 2],
                point.y + numbers[j + 3]
              );
              control.x = point.x + numbers[j + 0];
              control.y = point.y + numbers[j + 1];
              point.x += numbers[j + 2];
              point.y += numbers[j + 3];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "q":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 4) {
              path.quadraticCurveTo(
                point.x + numbers[j + 0],
                point.y + numbers[j + 1],
                point.x + numbers[j + 2],
                point.y + numbers[j + 3]
              );
              control.x = point.x + numbers[j + 0];
              control.y = point.y + numbers[j + 1];
              point.x += numbers[j + 2];
              point.y += numbers[j + 3];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "t":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 2) {
              const rx = getReflection(point.x, control.x);
              const ry = getReflection(point.y, control.y);
              path.quadraticCurveTo(
                rx,
                ry,
                point.x + numbers[j + 0],
                point.y + numbers[j + 1]
              );
              control.x = rx;
              control.y = ry;
              point.x = point.x + numbers[j + 0];
              point.y = point.y + numbers[j + 1];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "a":
            numbers = parseFloats(data2, [3, 4], 7);
            for (let j = 0, jl = numbers.length; j < jl; j += 7) {
              if (numbers[j + 5] == 0 && numbers[j + 6] == 0) continue;
              const start = point.clone();
              point.x += numbers[j + 5];
              point.y += numbers[j + 6];
              control.x = point.x;
              control.y = point.y;
              parseArcCommand(
                path,
                numbers[j],
                numbers[j + 1],
                numbers[j + 2],
                numbers[j + 3],
                numbers[j + 4],
                start,
                point
              );
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "Z":
          case "z":
            path.currentPath.autoClose = true;
            if (path.currentPath.curves.length > 0) {
              point.copy(firstPoint);
              path.currentPath.currentPoint.copy(point);
              isFirstPoint = true;
            }
            break;
          default:
            console.warn(command);
        }
        doSetFirstPoint = false;
      }
      return path;
    }
    function parseCSSStylesheet(node) {
      if (!node.sheet || !node.sheet.cssRules || !node.sheet.cssRules.length) return;
      for (let i = 0; i < node.sheet.cssRules.length; i++) {
        const stylesheet = node.sheet.cssRules[i];
        if (stylesheet.type !== 1) continue;
        const selectorList = stylesheet.selectorText.split(/,/gm).filter(Boolean).map((i2) => i2.trim());
        for (let j = 0; j < selectorList.length; j++) {
          const definitions = Object.fromEntries(
            Object.entries(stylesheet.style).filter(([, v]) => v !== "")
          );
          stylesheets[selectorList[j]] = Object.assign(
            stylesheets[selectorList[j]] || {},
            definitions
          );
        }
      }
    }
    function parseArcCommand(path, rx, ry, x_axis_rotation, large_arc_flag, sweep_flag, start, end) {
      if (rx == 0 || ry == 0) {
        path.lineTo(end.x, end.y);
        return;
      }
      x_axis_rotation = x_axis_rotation * Math.PI / 180;
      rx = Math.abs(rx);
      ry = Math.abs(ry);
      const dx2 = (start.x - end.x) / 2;
      const dy2 = (start.y - end.y) / 2;
      const x1p = Math.cos(x_axis_rotation) * dx2 + Math.sin(x_axis_rotation) * dy2;
      const y1p = -Math.sin(x_axis_rotation) * dx2 + Math.cos(x_axis_rotation) * dy2;
      let rxs = rx * rx;
      let rys = ry * ry;
      const x1ps = x1p * x1p;
      const y1ps = y1p * y1p;
      const cr = x1ps / rxs + y1ps / rys;
      if (cr > 1) {
        const s = Math.sqrt(cr);
        rx = s * rx;
        ry = s * ry;
        rxs = rx * rx;
        rys = ry * ry;
      }
      const dq = rxs * y1ps + rys * x1ps;
      const pq = (rxs * rys - dq) / dq;
      let q = Math.sqrt(Math.max(0, pq));
      if (large_arc_flag === sweep_flag) q = -q;
      const cxp = q * rx * y1p / ry;
      const cyp = -q * ry * x1p / rx;
      const cx = Math.cos(x_axis_rotation) * cxp - Math.sin(x_axis_rotation) * cyp + (start.x + end.x) / 2;
      const cy = Math.sin(x_axis_rotation) * cxp + Math.cos(x_axis_rotation) * cyp + (start.y + end.y) / 2;
      const theta = svgAngle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
      const delta = svgAngle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry) % (Math.PI * 2);
      path.currentPath.absellipse(cx, cy, rx, ry, theta, theta + delta, sweep_flag === 0, x_axis_rotation);
    }
    function svgAngle(ux, uy, vx, vy) {
      const dot = ux * vx + uy * vy;
      const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
      let ang = Math.acos(Math.max(-1, Math.min(1, dot / len)));
      if (ux * vy - uy * vx < 0) ang = -ang;
      return ang;
    }
    function parseRectNode(node) {
      const x = parseFloatWithUnits(node.getAttribute("x") || 0);
      const y = parseFloatWithUnits(node.getAttribute("y") || 0);
      const rx = parseFloatWithUnits(node.getAttribute("rx") || node.getAttribute("ry") || 0);
      const ry = parseFloatWithUnits(node.getAttribute("ry") || node.getAttribute("rx") || 0);
      const w = parseFloatWithUnits(node.getAttribute("width"));
      const h = parseFloatWithUnits(node.getAttribute("height"));
      const bci = 1 - 0.551915024494;
      const path = new ShapePath();
      path.moveTo(x + rx, y);
      path.lineTo(x + w - rx, y);
      if (rx !== 0 || ry !== 0) {
        path.bezierCurveTo(
          x + w - rx * bci,
          y,
          x + w,
          y + ry * bci,
          x + w,
          y + ry
        );
      }
      path.lineTo(x + w, y + h - ry);
      if (rx !== 0 || ry !== 0) {
        path.bezierCurveTo(
          x + w,
          y + h - ry * bci,
          x + w - rx * bci,
          y + h,
          x + w - rx,
          y + h
        );
      }
      path.lineTo(x + rx, y + h);
      if (rx !== 0 || ry !== 0) {
        path.bezierCurveTo(
          x + rx * bci,
          y + h,
          x,
          y + h - ry * bci,
          x,
          y + h - ry
        );
      }
      path.lineTo(x, y + ry);
      if (rx !== 0 || ry !== 0) {
        path.bezierCurveTo(x, y + ry * bci, x + rx * bci, y, x + rx, y);
      }
      return path;
    }
    function parsePolygonNode(node) {
      function iterator(match, a, b) {
        const x = parseFloatWithUnits(a);
        const y = parseFloatWithUnits(b);
        if (index === 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
        index++;
      }
      const regex = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g;
      const path = new ShapePath();
      let index = 0;
      node.getAttribute("points").replace(regex, iterator);
      path.currentPath.autoClose = true;
      return path;
    }
    function parsePolylineNode(node) {
      function iterator(match, a, b) {
        const x = parseFloatWithUnits(a);
        const y = parseFloatWithUnits(b);
        if (index === 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
        index++;
      }
      const regex = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g;
      const path = new ShapePath();
      let index = 0;
      node.getAttribute("points").replace(regex, iterator);
      path.currentPath.autoClose = false;
      return path;
    }
    function parseCircleNode(node) {
      const x = parseFloatWithUnits(node.getAttribute("cx") || 0);
      const y = parseFloatWithUnits(node.getAttribute("cy") || 0);
      const r = parseFloatWithUnits(node.getAttribute("r") || 0);
      const subpath = new Path();
      subpath.absarc(x, y, r, 0, Math.PI * 2);
      const path = new ShapePath();
      path.subPaths.push(subpath);
      return path;
    }
    function parseEllipseNode(node) {
      const x = parseFloatWithUnits(node.getAttribute("cx") || 0);
      const y = parseFloatWithUnits(node.getAttribute("cy") || 0);
      const rx = parseFloatWithUnits(node.getAttribute("rx") || 0);
      const ry = parseFloatWithUnits(node.getAttribute("ry") || 0);
      const subpath = new Path();
      subpath.absellipse(x, y, rx, ry, 0, Math.PI * 2);
      const path = new ShapePath();
      path.subPaths.push(subpath);
      return path;
    }
    function parseLineNode(node) {
      const x1 = parseFloatWithUnits(node.getAttribute("x1") || 0);
      const y1 = parseFloatWithUnits(node.getAttribute("y1") || 0);
      const x2 = parseFloatWithUnits(node.getAttribute("x2") || 0);
      const y2 = parseFloatWithUnits(node.getAttribute("y2") || 0);
      const path = new ShapePath();
      path.moveTo(x1, y1);
      path.lineTo(x2, y2);
      path.currentPath.autoClose = false;
      return path;
    }
    function parseStyle(node, style) {
      style = Object.assign({}, style);
      let stylesheetStyles = {};
      if (node.hasAttribute("class")) {
        const classSelectors = node.getAttribute("class").split(/\s/).filter(Boolean).map((i) => i.trim());
        for (let i = 0; i < classSelectors.length; i++) {
          stylesheetStyles = Object.assign(stylesheetStyles, stylesheets["." + classSelectors[i]]);
        }
      }
      if (node.hasAttribute("id")) {
        stylesheetStyles = Object.assign(stylesheetStyles, stylesheets["#" + node.getAttribute("id")]);
      }
      function addStyle(svgName, jsName, adjustFunction) {
        if (adjustFunction === void 0) adjustFunction = function copy(v) {
          if (v.startsWith("url")) console.warn("SVGLoader: url access in attributes is not implemented.");
          return v;
        };
        if (node.hasAttribute(svgName)) style[jsName] = adjustFunction(node.getAttribute(svgName));
        if (stylesheetStyles[svgName]) style[jsName] = adjustFunction(stylesheetStyles[svgName]);
        if (node.style && node.style[svgName] !== "") style[jsName] = adjustFunction(node.style[svgName]);
      }
      function clamp(v) {
        return Math.max(0, Math.min(1, parseFloatWithUnits(v)));
      }
      function positive(v) {
        return Math.max(0, parseFloatWithUnits(v));
      }
      addStyle("fill", "fill");
      addStyle("fill-opacity", "fillOpacity", clamp);
      addStyle("fill-rule", "fillRule");
      addStyle("opacity", "opacity", clamp);
      addStyle("stroke", "stroke");
      addStyle("stroke-opacity", "strokeOpacity", clamp);
      addStyle("stroke-width", "strokeWidth", positive);
      addStyle("stroke-linejoin", "strokeLineJoin");
      addStyle("stroke-linecap", "strokeLineCap");
      addStyle("stroke-miterlimit", "strokeMiterLimit", positive);
      addStyle("visibility", "visibility");
      return style;
    }
    function getReflection(a, b) {
      return a - (b - a);
    }
    function parseFloats(input, flags, stride) {
      if (typeof input !== "string") {
        throw new TypeError("Invalid input: " + typeof input);
      }
      const RE = {
        SEPARATOR: /[ \t\r\n\,.\-+]/,
        WHITESPACE: /[ \t\r\n]/,
        DIGIT: /[\d]/,
        SIGN: /[-+]/,
        POINT: /\./,
        COMMA: /,/,
        EXP: /e/i,
        FLAGS: /[01]/
      };
      const SEP = 0;
      const INT = 1;
      const FLOAT = 2;
      const EXP = 3;
      let state = SEP;
      let seenComma = true;
      let number = "", exponent = "";
      const result = [];
      function throwSyntaxError(current2, i, partial) {
        const error = new SyntaxError('Unexpected character "' + current2 + '" at index ' + i + ".");
        error.partial = partial;
        throw error;
      }
      function newNumber() {
        if (number !== "") {
          if (exponent === "") result.push(Number(number));
          else result.push(Number(number) * Math.pow(10, Number(exponent)));
        }
        number = "";
        exponent = "";
      }
      let current;
      const length = input.length;
      for (let i = 0; i < length; i++) {
        current = input[i];
        if (Array.isArray(flags) && flags.includes(result.length % stride) && RE.FLAGS.test(current)) {
          state = INT;
          number = current;
          newNumber();
          continue;
        }
        if (state === SEP) {
          if (RE.WHITESPACE.test(current)) {
            continue;
          }
          if (RE.DIGIT.test(current) || RE.SIGN.test(current)) {
            state = INT;
            number = current;
            continue;
          }
          if (RE.POINT.test(current)) {
            state = FLOAT;
            number = current;
            continue;
          }
          if (RE.COMMA.test(current)) {
            if (seenComma) {
              throwSyntaxError(current, i, result);
            }
            seenComma = true;
          }
        }
        if (state === INT) {
          if (RE.DIGIT.test(current)) {
            number += current;
            continue;
          }
          if (RE.POINT.test(current)) {
            number += current;
            state = FLOAT;
            continue;
          }
          if (RE.EXP.test(current)) {
            state = EXP;
            continue;
          }
          if (RE.SIGN.test(current) && number.length === 1 && RE.SIGN.test(number[0])) {
            throwSyntaxError(current, i, result);
          }
        }
        if (state === FLOAT) {
          if (RE.DIGIT.test(current)) {
            number += current;
            continue;
          }
          if (RE.EXP.test(current)) {
            state = EXP;
            continue;
          }
          if (RE.POINT.test(current) && number[number.length - 1] === ".") {
            throwSyntaxError(current, i, result);
          }
        }
        if (state === EXP) {
          if (RE.DIGIT.test(current)) {
            exponent += current;
            continue;
          }
          if (RE.SIGN.test(current)) {
            if (exponent === "") {
              exponent += current;
              continue;
            }
            if (exponent.length === 1 && RE.SIGN.test(exponent)) {
              throwSyntaxError(current, i, result);
            }
          }
        }
        if (RE.WHITESPACE.test(current)) {
          newNumber();
          state = SEP;
          seenComma = false;
        } else if (RE.COMMA.test(current)) {
          newNumber();
          state = SEP;
          seenComma = true;
        } else if (RE.SIGN.test(current)) {
          newNumber();
          state = INT;
          number = current;
        } else if (RE.POINT.test(current)) {
          newNumber();
          state = FLOAT;
          number = current;
        } else {
          throwSyntaxError(current, i, result);
        }
      }
      newNumber();
      return result;
    }
    const units = ["mm", "cm", "in", "pt", "pc", "px"];
    const unitConversion = {
      "mm": {
        "mm": 1,
        "cm": 0.1,
        "in": 1 / 25.4,
        "pt": 72 / 25.4,
        "pc": 6 / 25.4,
        "px": -1
      },
      "cm": {
        "mm": 10,
        "cm": 1,
        "in": 1 / 2.54,
        "pt": 72 / 2.54,
        "pc": 6 / 2.54,
        "px": -1
      },
      "in": {
        "mm": 25.4,
        "cm": 2.54,
        "in": 1,
        "pt": 72,
        "pc": 6,
        "px": -1
      },
      "pt": {
        "mm": 25.4 / 72,
        "cm": 2.54 / 72,
        "in": 1 / 72,
        "pt": 1,
        "pc": 6 / 72,
        "px": -1
      },
      "pc": {
        "mm": 25.4 / 6,
        "cm": 2.54 / 6,
        "in": 1 / 6,
        "pt": 72 / 6,
        "pc": 1,
        "px": -1
      },
      "px": {
        "px": 1
      }
    };
    function parseFloatWithUnits(string) {
      let theUnit = "px";
      if (typeof string === "string" || string instanceof String) {
        for (let i = 0, n = units.length; i < n; i++) {
          const u = units[i];
          if (string.endsWith(u)) {
            theUnit = u;
            string = string.substring(0, string.length - u.length);
            break;
          }
        }
      }
      let scale = void 0;
      if (theUnit === "px" && scope.defaultUnit !== "px") {
        scale = unitConversion["in"][scope.defaultUnit] / scope.defaultDPI;
      } else {
        scale = unitConversion[theUnit][scope.defaultUnit];
        if (scale < 0) {
          scale = unitConversion[theUnit]["in"] * scope.defaultDPI;
        }
      }
      return scale * parseFloat(string);
    }
    function getNodeTransform(node) {
      if (!(node.hasAttribute("transform") || node.nodeName === "use" && (node.hasAttribute("x") || node.hasAttribute("y")))) {
        return null;
      }
      const transform = parseNodeTransform(node);
      if (transformStack.length > 0) {
        transform.premultiply(transformStack[transformStack.length - 1]);
      }
      currentTransform.copy(transform);
      transformStack.push(transform);
      return transform;
    }
    function parseNodeTransform(node) {
      const transform = new Matrix3();
      const currentTransform2 = tempTransform0;
      if (node.nodeName === "use" && (node.hasAttribute("x") || node.hasAttribute("y"))) {
        const tx = parseFloatWithUnits(node.getAttribute("x"));
        const ty = parseFloatWithUnits(node.getAttribute("y"));
        transform.translate(tx, ty);
      }
      if (node.hasAttribute("transform")) {
        const transformsTexts = node.getAttribute("transform").split(")");
        for (let tIndex = transformsTexts.length - 1; tIndex >= 0; tIndex--) {
          const transformText = transformsTexts[tIndex].trim();
          if (transformText === "") continue;
          const openParPos = transformText.indexOf("(");
          const closeParPos = transformText.length;
          if (openParPos > 0 && openParPos < closeParPos) {
            const transformType = transformText.slice(0, openParPos);
            const array = parseFloats(transformText.slice(openParPos + 1));
            currentTransform2.identity();
            switch (transformType) {
              case "translate":
                if (array.length >= 1) {
                  const tx = array[0];
                  let ty = 0;
                  if (array.length >= 2) {
                    ty = array[1];
                  }
                  currentTransform2.translate(tx, ty);
                }
                break;
              case "rotate":
                if (array.length >= 1) {
                  let angle = 0;
                  let cx = 0;
                  let cy = 0;
                  angle = array[0] * Math.PI / 180;
                  if (array.length >= 3) {
                    cx = array[1];
                    cy = array[2];
                  }
                  tempTransform1.makeTranslation(-cx, -cy);
                  tempTransform2.makeRotation(angle);
                  tempTransform3.multiplyMatrices(tempTransform2, tempTransform1);
                  tempTransform1.makeTranslation(cx, cy);
                  currentTransform2.multiplyMatrices(tempTransform1, tempTransform3);
                }
                break;
              case "scale":
                if (array.length >= 1) {
                  const scaleX = array[0];
                  let scaleY = scaleX;
                  if (array.length >= 2) {
                    scaleY = array[1];
                  }
                  currentTransform2.scale(scaleX, scaleY);
                }
                break;
              case "skewX":
                if (array.length === 1) {
                  currentTransform2.set(
                    1,
                    Math.tan(array[0] * Math.PI / 180),
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    1
                  );
                }
                break;
              case "skewY":
                if (array.length === 1) {
                  currentTransform2.set(
                    1,
                    0,
                    0,
                    Math.tan(array[0] * Math.PI / 180),
                    1,
                    0,
                    0,
                    0,
                    1
                  );
                }
                break;
              case "matrix":
                if (array.length === 6) {
                  currentTransform2.set(
                    array[0],
                    array[2],
                    array[4],
                    array[1],
                    array[3],
                    array[5],
                    0,
                    0,
                    1
                  );
                }
                break;
            }
          }
          transform.premultiply(currentTransform2);
        }
      }
      return transform;
    }
    function transformPath(path, m) {
      function transfVec2(v2) {
        tempV3.set(v2.x, v2.y, 1).applyMatrix3(m);
        v2.set(tempV3.x, tempV3.y);
      }
      function transfEllipseGeneric(curve2) {
        const a = curve2.xRadius;
        const b = curve2.yRadius;
        const cosTheta = Math.cos(curve2.aRotation);
        const sinTheta = Math.sin(curve2.aRotation);
        const v1 = new Vector3(a * cosTheta, a * sinTheta, 0);
        const v2 = new Vector3(-b * sinTheta, b * cosTheta, 0);
        const f1 = v1.applyMatrix3(m);
        const f2 = v2.applyMatrix3(m);
        const mF = tempTransform0.set(
          f1.x,
          f2.x,
          0,
          f1.y,
          f2.y,
          0,
          0,
          0,
          1
        );
        const mFInv = tempTransform1.copy(mF).invert();
        const mFInvT = tempTransform2.copy(mFInv).transpose();
        const mQ = mFInvT.multiply(mFInv);
        const mQe = mQ.elements;
        const ed = eigenDecomposition(mQe[0], mQe[1], mQe[4]);
        const rt1sqrt = Math.sqrt(ed.rt1);
        const rt2sqrt = Math.sqrt(ed.rt2);
        curve2.xRadius = 1 / rt1sqrt;
        curve2.yRadius = 1 / rt2sqrt;
        curve2.aRotation = Math.atan2(ed.sn, ed.cs);
        const isFullEllipse = (curve2.aEndAngle - curve2.aStartAngle) % (2 * Math.PI) < Number.EPSILON;
        if (!isFullEllipse) {
          const mDsqrt = tempTransform1.set(
            rt1sqrt,
            0,
            0,
            0,
            rt2sqrt,
            0,
            0,
            0,
            1
          );
          const mRT = tempTransform2.set(
            ed.cs,
            ed.sn,
            0,
            -ed.sn,
            ed.cs,
            0,
            0,
            0,
            1
          );
          const mDRF = mDsqrt.multiply(mRT).multiply(mF);
          const transformAngle = (phi) => {
            const { x: cosR, y: sinR } = new Vector3(Math.cos(phi), Math.sin(phi), 0).applyMatrix3(mDRF);
            return Math.atan2(sinR, cosR);
          };
          curve2.aStartAngle = transformAngle(curve2.aStartAngle);
          curve2.aEndAngle = transformAngle(curve2.aEndAngle);
          if (isTransformFlipped(m)) {
            curve2.aClockwise = !curve2.aClockwise;
          }
        }
      }
      function transfEllipseNoSkew(curve2) {
        const sx = getTransformScaleX(m);
        const sy = getTransformScaleY(m);
        curve2.xRadius *= sx;
        curve2.yRadius *= sy;
        const theta = sx > Number.EPSILON ? Math.atan2(m.elements[1], m.elements[0]) : Math.atan2(-m.elements[3], m.elements[4]);
        curve2.aRotation += theta;
        if (isTransformFlipped(m)) {
          curve2.aStartAngle *= -1;
          curve2.aEndAngle *= -1;
          curve2.aClockwise = !curve2.aClockwise;
        }
      }
      const subPaths = path.subPaths;
      for (let i = 0, n = subPaths.length; i < n; i++) {
        const subPath = subPaths[i];
        const curves = subPath.curves;
        for (let j = 0; j < curves.length; j++) {
          const curve2 = curves[j];
          if (curve2.isLineCurve) {
            transfVec2(curve2.v1);
            transfVec2(curve2.v2);
          } else if (curve2.isCubicBezierCurve) {
            transfVec2(curve2.v0);
            transfVec2(curve2.v1);
            transfVec2(curve2.v2);
            transfVec2(curve2.v3);
          } else if (curve2.isQuadraticBezierCurve) {
            transfVec2(curve2.v0);
            transfVec2(curve2.v1);
            transfVec2(curve2.v2);
          } else if (curve2.isEllipseCurve) {
            tempV2.set(curve2.aX, curve2.aY);
            transfVec2(tempV2);
            curve2.aX = tempV2.x;
            curve2.aY = tempV2.y;
            if (isTransformSkewed(m)) {
              transfEllipseGeneric(curve2);
            } else {
              transfEllipseNoSkew(curve2);
            }
          }
        }
      }
    }
    function isTransformFlipped(m) {
      const te = m.elements;
      return te[0] * te[4] - te[1] * te[3] < 0;
    }
    function isTransformSkewed(m) {
      const te = m.elements;
      const basisDot = te[0] * te[3] + te[1] * te[4];
      if (basisDot === 0) return false;
      const sx = getTransformScaleX(m);
      const sy = getTransformScaleY(m);
      return Math.abs(basisDot / (sx * sy)) > Number.EPSILON;
    }
    function getTransformScaleX(m) {
      const te = m.elements;
      return Math.sqrt(te[0] * te[0] + te[1] * te[1]);
    }
    function getTransformScaleY(m) {
      const te = m.elements;
      return Math.sqrt(te[3] * te[3] + te[4] * te[4]);
    }
    function eigenDecomposition(A, B, C) {
      let rt1, rt2, cs, sn, t;
      const sm = A + C;
      const df = A - C;
      const rt = Math.sqrt(df * df + 4 * B * B);
      if (sm > 0) {
        rt1 = 0.5 * (sm + rt);
        t = 1 / rt1;
        rt2 = A * t * C - B * t * B;
      } else if (sm < 0) {
        rt2 = 0.5 * (sm - rt);
      } else {
        rt1 = 0.5 * rt;
        rt2 = -0.5 * rt;
      }
      if (df > 0) {
        cs = df + rt;
      } else {
        cs = df - rt;
      }
      if (Math.abs(cs) > 2 * Math.abs(B)) {
        t = -2 * B / cs;
        sn = 1 / Math.sqrt(1 + t * t);
        cs = t * sn;
      } else if (Math.abs(B) === 0) {
        cs = 1;
        sn = 0;
      } else {
        t = -0.5 * cs / B;
        cs = 1 / Math.sqrt(1 + t * t);
        sn = t * cs;
      }
      if (df > 0) {
        t = cs;
        cs = -sn;
        sn = t;
      }
      return { rt1, rt2, cs, sn };
    }
    const paths = [];
    const stylesheets = {};
    const transformStack = [];
    const tempTransform0 = new Matrix3();
    const tempTransform1 = new Matrix3();
    const tempTransform2 = new Matrix3();
    const tempTransform3 = new Matrix3();
    const tempV2 = new Vector2();
    const tempV3 = new Vector3();
    const currentTransform = new Matrix3();
    const xml = new DOMParser().parseFromString(text, "image/svg+xml");
    parseNode(xml.documentElement, {
      fill: "#000",
      fillOpacity: 1,
      strokeOpacity: 1,
      strokeWidth: 1,
      strokeLineJoin: "miter",
      strokeLineCap: "butt",
      strokeMiterLimit: 4
    });
    const data = { paths, xml: xml.documentElement };
    return data;
  }
  static createShapes(shapePath) {
    const BIGNUMBER = 999999999;
    const IntersectionLocationType = {
      ORIGIN: 0,
      DESTINATION: 1,
      BETWEEN: 2,
      LEFT: 3,
      RIGHT: 4,
      BEHIND: 5,
      BEYOND: 6
    };
    const classifyResult = {
      loc: IntersectionLocationType.ORIGIN,
      t: 0
    };
    function findEdgeIntersection(a0, a1, b0, b1) {
      const x1 = a0.x;
      const x2 = a1.x;
      const x3 = b0.x;
      const x4 = b1.x;
      const y1 = a0.y;
      const y2 = a1.y;
      const y3 = b0.y;
      const y4 = b1.y;
      const nom1 = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
      const nom2 = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
      const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
      const t1 = nom1 / denom;
      const t2 = nom2 / denom;
      if (denom === 0 && nom1 !== 0 || t1 <= 0 || t1 >= 1 || t2 < 0 || t2 > 1) {
        return null;
      } else if (nom1 === 0 && denom === 0) {
        for (let i = 0; i < 2; i++) {
          classifyPoint(i === 0 ? b0 : b1, a0, a1);
          if (classifyResult.loc == IntersectionLocationType.ORIGIN) {
            const point = i === 0 ? b0 : b1;
            return { x: point.x, y: point.y, t: classifyResult.t };
          } else if (classifyResult.loc == IntersectionLocationType.BETWEEN) {
            const x = +(x1 + classifyResult.t * (x2 - x1)).toPrecision(10);
            const y = +(y1 + classifyResult.t * (y2 - y1)).toPrecision(10);
            return { x, y, t: classifyResult.t };
          }
        }
        return null;
      } else {
        for (let i = 0; i < 2; i++) {
          classifyPoint(i === 0 ? b0 : b1, a0, a1);
          if (classifyResult.loc == IntersectionLocationType.ORIGIN) {
            const point = i === 0 ? b0 : b1;
            return { x: point.x, y: point.y, t: classifyResult.t };
          }
        }
        const x = +(x1 + t1 * (x2 - x1)).toPrecision(10);
        const y = +(y1 + t1 * (y2 - y1)).toPrecision(10);
        return { x, y, t: t1 };
      }
    }
    function classifyPoint(p, edgeStart, edgeEnd) {
      const ax = edgeEnd.x - edgeStart.x;
      const ay = edgeEnd.y - edgeStart.y;
      const bx = p.x - edgeStart.x;
      const by = p.y - edgeStart.y;
      const sa = ax * by - bx * ay;
      if (p.x === edgeStart.x && p.y === edgeStart.y) {
        classifyResult.loc = IntersectionLocationType.ORIGIN;
        classifyResult.t = 0;
        return;
      }
      if (p.x === edgeEnd.x && p.y === edgeEnd.y) {
        classifyResult.loc = IntersectionLocationType.DESTINATION;
        classifyResult.t = 1;
        return;
      }
      if (sa < -Number.EPSILON) {
        classifyResult.loc = IntersectionLocationType.LEFT;
        return;
      }
      if (sa > Number.EPSILON) {
        classifyResult.loc = IntersectionLocationType.RIGHT;
        return;
      }
      if (ax * bx < 0 || ay * by < 0) {
        classifyResult.loc = IntersectionLocationType.BEHIND;
        return;
      }
      if (Math.sqrt(ax * ax + ay * ay) < Math.sqrt(bx * bx + by * by)) {
        classifyResult.loc = IntersectionLocationType.BEYOND;
        return;
      }
      let t;
      if (ax !== 0) {
        t = bx / ax;
      } else {
        t = by / ay;
      }
      classifyResult.loc = IntersectionLocationType.BETWEEN;
      classifyResult.t = t;
    }
    function getIntersections(path1, path2) {
      const intersectionsRaw = [];
      const intersections = [];
      for (let index = 1; index < path1.length; index++) {
        const path1EdgeStart = path1[index - 1];
        const path1EdgeEnd = path1[index];
        for (let index2 = 1; index2 < path2.length; index2++) {
          const path2EdgeStart = path2[index2 - 1];
          const path2EdgeEnd = path2[index2];
          const intersection = findEdgeIntersection(path1EdgeStart, path1EdgeEnd, path2EdgeStart, path2EdgeEnd);
          if (intersection !== null && intersectionsRaw.find((i) => i.t <= intersection.t + Number.EPSILON && i.t >= intersection.t - Number.EPSILON) === void 0) {
            intersectionsRaw.push(intersection);
            intersections.push(new Vector2(intersection.x, intersection.y));
          }
        }
      }
      return intersections;
    }
    function getScanlineIntersections(scanline, boundingBox, paths) {
      const center2 = new Vector2();
      boundingBox.getCenter(center2);
      const allIntersections = [];
      paths.forEach((path) => {
        if (path.boundingBox.containsPoint(center2)) {
          const intersections = getIntersections(scanline, path.points);
          intersections.forEach((p) => {
            allIntersections.push({ identifier: path.identifier, isCW: path.isCW, point: p });
          });
        }
      });
      allIntersections.sort((i1, i2) => {
        return i1.point.x - i2.point.x;
      });
      return allIntersections;
    }
    function isHoleTo(simplePath, allPaths, scanlineMinX2, scanlineMaxX2, _fillRule) {
      if (_fillRule === null || _fillRule === void 0 || _fillRule === "") {
        _fillRule = "nonzero";
      }
      const centerBoundingBox = new Vector2();
      simplePath.boundingBox.getCenter(centerBoundingBox);
      const scanline = [new Vector2(scanlineMinX2, centerBoundingBox.y), new Vector2(scanlineMaxX2, centerBoundingBox.y)];
      const scanlineIntersections = getScanlineIntersections(scanline, simplePath.boundingBox, allPaths);
      scanlineIntersections.sort((i1, i2) => {
        return i1.point.x - i2.point.x;
      });
      const baseIntersections = [];
      const otherIntersections = [];
      scanlineIntersections.forEach((i2) => {
        if (i2.identifier === simplePath.identifier) {
          baseIntersections.push(i2);
        } else {
          otherIntersections.push(i2);
        }
      });
      const firstXOfPath = baseIntersections[0].point.x;
      const stack = [];
      let i = 0;
      while (i < otherIntersections.length && otherIntersections[i].point.x < firstXOfPath) {
        if (stack.length > 0 && stack[stack.length - 1] === otherIntersections[i].identifier) {
          stack.pop();
        } else {
          stack.push(otherIntersections[i].identifier);
        }
        i++;
      }
      stack.push(simplePath.identifier);
      if (_fillRule === "evenodd") {
        const isHole = stack.length % 2 === 0 ? true : false;
        const isHoleFor = stack[stack.length - 2];
        return { identifier: simplePath.identifier, isHole, for: isHoleFor };
      } else if (_fillRule === "nonzero") {
        let isHole = true;
        let isHoleFor = null;
        let lastCWValue = null;
        for (let i2 = 0; i2 < stack.length; i2++) {
          const identifier = stack[i2];
          if (isHole) {
            lastCWValue = allPaths[identifier].isCW;
            isHole = false;
            isHoleFor = identifier;
          } else if (lastCWValue !== allPaths[identifier].isCW) {
            lastCWValue = allPaths[identifier].isCW;
            isHole = true;
          }
        }
        return { identifier: simplePath.identifier, isHole, for: isHoleFor };
      } else {
        console.warn('fill-rule: "' + _fillRule + '" is currently not implemented.');
      }
    }
    let scanlineMinX = BIGNUMBER;
    let scanlineMaxX = -BIGNUMBER;
    let simplePaths = shapePath.subPaths.map((p) => {
      const points2 = p.getPoints();
      let maxY = -BIGNUMBER;
      let minY = BIGNUMBER;
      let maxX = -BIGNUMBER;
      let minX = BIGNUMBER;
      for (let i = 0; i < points2.length; i++) {
        const p2 = points2[i];
        if (p2.y > maxY) {
          maxY = p2.y;
        }
        if (p2.y < minY) {
          minY = p2.y;
        }
        if (p2.x > maxX) {
          maxX = p2.x;
        }
        if (p2.x < minX) {
          minX = p2.x;
        }
      }
      if (scanlineMaxX <= maxX) {
        scanlineMaxX = maxX + 1;
      }
      if (scanlineMinX >= minX) {
        scanlineMinX = minX - 1;
      }
      return { curves: p.curves, points: points2, isCW: ShapeUtils.isClockWise(points2), identifier: -1, boundingBox: new Box2(new Vector2(minX, minY), new Vector2(maxX, maxY)) };
    });
    simplePaths = simplePaths.filter((sp) => sp.points.length > 1);
    for (let identifier = 0; identifier < simplePaths.length; identifier++) {
      simplePaths[identifier].identifier = identifier;
    }
    const isAHole = simplePaths.map((p) => isHoleTo(p, simplePaths, scanlineMinX, scanlineMaxX, shapePath.userData ? shapePath.userData.style.fillRule : void 0));
    const shapesToReturn = [];
    simplePaths.forEach((p) => {
      const amIAHole = isAHole[p.identifier];
      if (!amIAHole.isHole) {
        const shape = new Shape();
        shape.curves = p.curves;
        const holes = isAHole.filter((h) => h.isHole && h.for === p.identifier);
        holes.forEach((h) => {
          const hole = simplePaths[h.identifier];
          const path = new Path();
          path.curves = hole.curves;
          shape.holes.push(path);
        });
        shapesToReturn.push(shape);
      }
    });
    return shapesToReturn;
  }
  static getStrokeStyle(width, color, lineJoin, lineCap, miterLimit) {
    width = width !== void 0 ? width : 1;
    color = color !== void 0 ? color : "#000";
    lineJoin = lineJoin !== void 0 ? lineJoin : "miter";
    lineCap = lineCap !== void 0 ? lineCap : "butt";
    miterLimit = miterLimit !== void 0 ? miterLimit : 4;
    return {
      strokeColor: color,
      strokeWidth: width,
      strokeLineJoin: lineJoin,
      strokeLineCap: lineCap,
      strokeMiterLimit: miterLimit
    };
  }
  static pointsToStroke(points2, style, arcDivisions, minDistance) {
    const vertices = [];
    const normals = [];
    const uvs = [];
    if (SVGLoader.pointsToStrokeWithBuffers(points2, style, arcDivisions, minDistance, vertices, normals, uvs) === 0) {
      return null;
    }
    const geometry2 = new BufferGeometry();
    geometry2.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry2.setAttribute("normal", new Float32BufferAttribute(normals, 3));
    geometry2.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    return geometry2;
  }
  static pointsToStrokeWithBuffers(points2, style, arcDivisions, minDistance, vertices, normals, uvs, vertexOffset) {
    const tempV2_1 = new Vector2();
    const tempV2_2 = new Vector2();
    const tempV2_3 = new Vector2();
    const tempV2_4 = new Vector2();
    const tempV2_5 = new Vector2();
    const tempV2_6 = new Vector2();
    const tempV2_7 = new Vector2();
    const lastPointL = new Vector2();
    const lastPointR = new Vector2();
    const point0L = new Vector2();
    const point0R = new Vector2();
    const currentPointL = new Vector2();
    const currentPointR = new Vector2();
    const nextPointL = new Vector2();
    const nextPointR = new Vector2();
    const innerPoint = new Vector2();
    const outerPoint = new Vector2();
    arcDivisions = arcDivisions !== void 0 ? arcDivisions : 12;
    minDistance = minDistance !== void 0 ? minDistance : 1e-3;
    vertexOffset = vertexOffset !== void 0 ? vertexOffset : 0;
    points2 = removeDuplicatedPoints(points2);
    const numPoints = points2.length;
    if (numPoints < 2) return 0;
    const isClosed = points2[0].equals(points2[numPoints - 1]);
    let currentPoint;
    let previousPoint = points2[0];
    let nextPoint;
    const strokeWidth2 = style.strokeWidth / 2;
    const deltaU = 1 / (numPoints - 1);
    let u0 = 0, u1;
    let innerSideModified;
    let joinIsOnLeftSide;
    let isMiter;
    let initialJoinIsOnLeftSide = false;
    let numVertices = 0;
    let currentCoordinate = vertexOffset * 3;
    let currentCoordinateUV = vertexOffset * 2;
    getNormal(points2[0], points2[1], tempV2_1).multiplyScalar(strokeWidth2);
    lastPointL.copy(points2[0]).sub(tempV2_1);
    lastPointR.copy(points2[0]).add(tempV2_1);
    point0L.copy(lastPointL);
    point0R.copy(lastPointR);
    for (let iPoint = 1; iPoint < numPoints; iPoint++) {
      currentPoint = points2[iPoint];
      if (iPoint === numPoints - 1) {
        if (isClosed) {
          nextPoint = points2[1];
        } else nextPoint = void 0;
      } else {
        nextPoint = points2[iPoint + 1];
      }
      const normal1 = tempV2_1;
      getNormal(previousPoint, currentPoint, normal1);
      tempV2_3.copy(normal1).multiplyScalar(strokeWidth2);
      currentPointL.copy(currentPoint).sub(tempV2_3);
      currentPointR.copy(currentPoint).add(tempV2_3);
      u1 = u0 + deltaU;
      innerSideModified = false;
      if (nextPoint !== void 0) {
        getNormal(currentPoint, nextPoint, tempV2_2);
        tempV2_3.copy(tempV2_2).multiplyScalar(strokeWidth2);
        nextPointL.copy(currentPoint).sub(tempV2_3);
        nextPointR.copy(currentPoint).add(tempV2_3);
        joinIsOnLeftSide = true;
        tempV2_3.subVectors(nextPoint, previousPoint);
        if (normal1.dot(tempV2_3) < 0) {
          joinIsOnLeftSide = false;
        }
        if (iPoint === 1) initialJoinIsOnLeftSide = joinIsOnLeftSide;
        tempV2_3.subVectors(nextPoint, currentPoint);
        tempV2_3.normalize();
        const dot = Math.abs(normal1.dot(tempV2_3));
        if (dot > Number.EPSILON) {
          const miterSide = strokeWidth2 / dot;
          tempV2_3.multiplyScalar(-miterSide);
          tempV2_4.subVectors(currentPoint, previousPoint);
          tempV2_5.copy(tempV2_4).setLength(miterSide).add(tempV2_3);
          innerPoint.copy(tempV2_5).negate();
          const miterLength2 = tempV2_5.length();
          const segmentLengthPrev = tempV2_4.length();
          tempV2_4.divideScalar(segmentLengthPrev);
          tempV2_6.subVectors(nextPoint, currentPoint);
          const segmentLengthNext = tempV2_6.length();
          tempV2_6.divideScalar(segmentLengthNext);
          if (tempV2_4.dot(innerPoint) < segmentLengthPrev && tempV2_6.dot(innerPoint) < segmentLengthNext) {
            innerSideModified = true;
          }
          outerPoint.copy(tempV2_5).add(currentPoint);
          innerPoint.add(currentPoint);
          isMiter = false;
          if (innerSideModified) {
            if (joinIsOnLeftSide) {
              nextPointR.copy(innerPoint);
              currentPointR.copy(innerPoint);
            } else {
              nextPointL.copy(innerPoint);
              currentPointL.copy(innerPoint);
            }
          } else {
            makeSegmentTriangles();
          }
          switch (style.strokeLineJoin) {
            case "bevel":
              makeSegmentWithBevelJoin(joinIsOnLeftSide, innerSideModified, u1);
              break;
            case "round":
              createSegmentTrianglesWithMiddleSection(joinIsOnLeftSide, innerSideModified);
              if (joinIsOnLeftSide) {
                makeCircularSector(currentPoint, currentPointL, nextPointL, u1, 0);
              } else {
                makeCircularSector(currentPoint, nextPointR, currentPointR, u1, 1);
              }
              break;
            case "miter":
            case "miter-clip":
            default:
              const miterFraction = strokeWidth2 * style.strokeMiterLimit / miterLength2;
              if (miterFraction < 1) {
                if (style.strokeLineJoin !== "miter-clip") {
                  makeSegmentWithBevelJoin(joinIsOnLeftSide, innerSideModified, u1);
                  break;
                } else {
                  createSegmentTrianglesWithMiddleSection(joinIsOnLeftSide, innerSideModified);
                  if (joinIsOnLeftSide) {
                    tempV2_6.subVectors(outerPoint, currentPointL).multiplyScalar(miterFraction).add(currentPointL);
                    tempV2_7.subVectors(outerPoint, nextPointL).multiplyScalar(miterFraction).add(nextPointL);
                    addVertex(currentPointL, u1, 0);
                    addVertex(tempV2_6, u1, 0);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(tempV2_6, u1, 0);
                    addVertex(tempV2_7, u1, 0);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(tempV2_7, u1, 0);
                    addVertex(nextPointL, u1, 0);
                  } else {
                    tempV2_6.subVectors(outerPoint, currentPointR).multiplyScalar(miterFraction).add(currentPointR);
                    tempV2_7.subVectors(outerPoint, nextPointR).multiplyScalar(miterFraction).add(nextPointR);
                    addVertex(currentPointR, u1, 1);
                    addVertex(tempV2_6, u1, 1);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(tempV2_6, u1, 1);
                    addVertex(tempV2_7, u1, 1);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(tempV2_7, u1, 1);
                    addVertex(nextPointR, u1, 1);
                  }
                }
              } else {
                if (innerSideModified) {
                  if (joinIsOnLeftSide) {
                    addVertex(lastPointR, u0, 1);
                    addVertex(lastPointL, u0, 0);
                    addVertex(outerPoint, u1, 0);
                    addVertex(lastPointR, u0, 1);
                    addVertex(outerPoint, u1, 0);
                    addVertex(innerPoint, u1, 1);
                  } else {
                    addVertex(lastPointR, u0, 1);
                    addVertex(lastPointL, u0, 0);
                    addVertex(outerPoint, u1, 1);
                    addVertex(lastPointL, u0, 0);
                    addVertex(innerPoint, u1, 0);
                    addVertex(outerPoint, u1, 1);
                  }
                  if (joinIsOnLeftSide) {
                    nextPointL.copy(outerPoint);
                  } else {
                    nextPointR.copy(outerPoint);
                  }
                } else {
                  if (joinIsOnLeftSide) {
                    addVertex(currentPointL, u1, 0);
                    addVertex(outerPoint, u1, 0);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(outerPoint, u1, 0);
                    addVertex(nextPointL, u1, 0);
                  } else {
                    addVertex(currentPointR, u1, 1);
                    addVertex(outerPoint, u1, 1);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(outerPoint, u1, 1);
                    addVertex(nextPointR, u1, 1);
                  }
                }
                isMiter = true;
              }
              break;
          }
        } else {
          makeSegmentTriangles();
        }
      } else {
        makeSegmentTriangles();
      }
      if (!isClosed && iPoint === numPoints - 1) {
        addCapGeometry(points2[0], point0L, point0R, joinIsOnLeftSide, true, u0);
      }
      u0 = u1;
      previousPoint = currentPoint;
      lastPointL.copy(nextPointL);
      lastPointR.copy(nextPointR);
    }
    if (!isClosed) {
      addCapGeometry(currentPoint, currentPointL, currentPointR, joinIsOnLeftSide, false, u1);
    } else if (innerSideModified && vertices) {
      let lastOuter = outerPoint;
      let lastInner = innerPoint;
      if (initialJoinIsOnLeftSide !== joinIsOnLeftSide) {
        lastOuter = innerPoint;
        lastInner = outerPoint;
      }
      if (joinIsOnLeftSide) {
        if (isMiter || initialJoinIsOnLeftSide) {
          lastInner.toArray(vertices, 0 * 3);
          lastInner.toArray(vertices, 3 * 3);
          if (isMiter) {
            lastOuter.toArray(vertices, 1 * 3);
          }
        }
      } else {
        if (isMiter || !initialJoinIsOnLeftSide) {
          lastInner.toArray(vertices, 1 * 3);
          lastInner.toArray(vertices, 3 * 3);
          if (isMiter) {
            lastOuter.toArray(vertices, 0 * 3);
          }
        }
      }
    }
    return numVertices;
    function getNormal(p1, p2, result) {
      result.subVectors(p2, p1);
      return result.set(-result.y, result.x).normalize();
    }
    function addVertex(position, u, v) {
      if (vertices) {
        vertices[currentCoordinate] = position.x;
        vertices[currentCoordinate + 1] = position.y;
        vertices[currentCoordinate + 2] = 0;
        if (normals) {
          normals[currentCoordinate] = 0;
          normals[currentCoordinate + 1] = 0;
          normals[currentCoordinate + 2] = 1;
        }
        currentCoordinate += 3;
        if (uvs) {
          uvs[currentCoordinateUV] = u;
          uvs[currentCoordinateUV + 1] = v;
          currentCoordinateUV += 2;
        }
      }
      numVertices += 3;
    }
    function makeCircularSector(center2, p1, p2, u, v) {
      tempV2_1.copy(p1).sub(center2).normalize();
      tempV2_2.copy(p2).sub(center2).normalize();
      let angle = Math.PI;
      const dot = tempV2_1.dot(tempV2_2);
      if (Math.abs(dot) < 1) angle = Math.abs(Math.acos(dot));
      angle /= arcDivisions;
      tempV2_3.copy(p1);
      for (let i = 0, il = arcDivisions - 1; i < il; i++) {
        tempV2_4.copy(tempV2_3).rotateAround(center2, angle);
        addVertex(tempV2_3, u, v);
        addVertex(tempV2_4, u, v);
        addVertex(center2, u, 0.5);
        tempV2_3.copy(tempV2_4);
      }
      addVertex(tempV2_4, u, v);
      addVertex(p2, u, v);
      addVertex(center2, u, 0.5);
    }
    function makeSegmentTriangles() {
      addVertex(lastPointR, u0, 1);
      addVertex(lastPointL, u0, 0);
      addVertex(currentPointL, u1, 0);
      addVertex(lastPointR, u0, 1);
      addVertex(currentPointL, u1, 0);
      addVertex(currentPointR, u1, 1);
    }
    function makeSegmentWithBevelJoin(joinIsOnLeftSide2, innerSideModified2, u) {
      if (innerSideModified2) {
        if (joinIsOnLeftSide2) {
          addVertex(lastPointR, u0, 1);
          addVertex(lastPointL, u0, 0);
          addVertex(currentPointL, u1, 0);
          addVertex(lastPointR, u0, 1);
          addVertex(currentPointL, u1, 0);
          addVertex(innerPoint, u1, 1);
          addVertex(currentPointL, u, 0);
          addVertex(nextPointL, u, 0);
          addVertex(innerPoint, u, 0.5);
        } else {
          addVertex(lastPointR, u0, 1);
          addVertex(lastPointL, u0, 0);
          addVertex(currentPointR, u1, 1);
          addVertex(lastPointL, u0, 0);
          addVertex(innerPoint, u1, 0);
          addVertex(currentPointR, u1, 1);
          addVertex(currentPointR, u, 1);
          addVertex(innerPoint, u, 0);
          addVertex(nextPointR, u, 1);
        }
      } else {
        if (joinIsOnLeftSide2) {
          addVertex(currentPointL, u, 0);
          addVertex(nextPointL, u, 0);
          addVertex(currentPoint, u, 0.5);
        } else {
          addVertex(currentPointR, u, 1);
          addVertex(nextPointR, u, 0);
          addVertex(currentPoint, u, 0.5);
        }
      }
    }
    function createSegmentTrianglesWithMiddleSection(joinIsOnLeftSide2, innerSideModified2) {
      if (innerSideModified2) {
        if (joinIsOnLeftSide2) {
          addVertex(lastPointR, u0, 1);
          addVertex(lastPointL, u0, 0);
          addVertex(currentPointL, u1, 0);
          addVertex(lastPointR, u0, 1);
          addVertex(currentPointL, u1, 0);
          addVertex(innerPoint, u1, 1);
          addVertex(currentPointL, u0, 0);
          addVertex(currentPoint, u1, 0.5);
          addVertex(innerPoint, u1, 1);
          addVertex(currentPoint, u1, 0.5);
          addVertex(nextPointL, u0, 0);
          addVertex(innerPoint, u1, 1);
        } else {
          addVertex(lastPointR, u0, 1);
          addVertex(lastPointL, u0, 0);
          addVertex(currentPointR, u1, 1);
          addVertex(lastPointL, u0, 0);
          addVertex(innerPoint, u1, 0);
          addVertex(currentPointR, u1, 1);
          addVertex(currentPointR, u0, 1);
          addVertex(innerPoint, u1, 0);
          addVertex(currentPoint, u1, 0.5);
          addVertex(currentPoint, u1, 0.5);
          addVertex(innerPoint, u1, 0);
          addVertex(nextPointR, u0, 1);
        }
      }
    }
    function addCapGeometry(center2, p1, p2, joinIsOnLeftSide2, start, u) {
      switch (style.strokeLineCap) {
        case "round":
          if (start) {
            makeCircularSector(center2, p2, p1, u, 0.5);
          } else {
            makeCircularSector(center2, p1, p2, u, 0.5);
          }
          break;
        case "square":
          if (start) {
            tempV2_1.subVectors(p1, center2);
            tempV2_2.set(tempV2_1.y, -tempV2_1.x);
            tempV2_3.addVectors(tempV2_1, tempV2_2).add(center2);
            tempV2_4.subVectors(tempV2_2, tempV2_1).add(center2);
            if (joinIsOnLeftSide2) {
              tempV2_3.toArray(vertices, 1 * 3);
              tempV2_4.toArray(vertices, 0 * 3);
              tempV2_4.toArray(vertices, 3 * 3);
            } else {
              tempV2_3.toArray(vertices, 1 * 3);
              uvs[3 * 2 + 1] === 1 ? tempV2_4.toArray(vertices, 3 * 3) : tempV2_3.toArray(vertices, 3 * 3);
              tempV2_4.toArray(vertices, 0 * 3);
            }
          } else {
            tempV2_1.subVectors(p2, center2);
            tempV2_2.set(tempV2_1.y, -tempV2_1.x);
            tempV2_3.addVectors(tempV2_1, tempV2_2).add(center2);
            tempV2_4.subVectors(tempV2_2, tempV2_1).add(center2);
            const vl = vertices.length;
            if (joinIsOnLeftSide2) {
              tempV2_3.toArray(vertices, vl - 1 * 3);
              tempV2_4.toArray(vertices, vl - 2 * 3);
              tempV2_4.toArray(vertices, vl - 4 * 3);
            } else {
              tempV2_4.toArray(vertices, vl - 2 * 3);
              tempV2_3.toArray(vertices, vl - 1 * 3);
              tempV2_4.toArray(vertices, vl - 4 * 3);
            }
          }
          break;
      }
    }
    function removeDuplicatedPoints(points3) {
      let dupPoints = false;
      for (let i = 1, n = points3.length - 1; i < n; i++) {
        if (points3[i].distanceTo(points3[i + 1]) < minDistance) {
          dupPoints = true;
          break;
        }
      }
      if (!dupPoints) return points3;
      const newPoints = [];
      newPoints.push(points3[0]);
      for (let i = 1, n = points3.length - 1; i < n; i++) {
        if (points3[i].distanceTo(points3[i + 1]) >= minDistance) {
          newPoints.push(points3[i]);
        }
      }
      newPoints.push(points3[points3.length - 1]);
      return newPoints;
    }
  }
}
function toTrianglesDrawMode(geometry2, drawMode) {
  if (drawMode === TrianglesDrawMode) {
    console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.");
    return geometry2;
  }
  if (drawMode === TriangleFanDrawMode || drawMode === TriangleStripDrawMode) {
    let index = geometry2.getIndex();
    if (index === null) {
      const indices = [];
      const position = geometry2.getAttribute("position");
      if (position !== void 0) {
        for (let i = 0; i < position.count; i++) {
          indices.push(i);
        }
        geometry2.setIndex(indices);
        index = geometry2.getIndex();
      } else {
        console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.");
        return geometry2;
      }
    }
    const numberOfTriangles = index.count - 2;
    const newIndices = [];
    if (drawMode === TriangleFanDrawMode) {
      for (let i = 1; i <= numberOfTriangles; i++) {
        newIndices.push(index.getX(0));
        newIndices.push(index.getX(i));
        newIndices.push(index.getX(i + 1));
      }
    } else {
      for (let i = 0; i < numberOfTriangles; i++) {
        if (i % 2 === 0) {
          newIndices.push(index.getX(i));
          newIndices.push(index.getX(i + 1));
          newIndices.push(index.getX(i + 2));
        } else {
          newIndices.push(index.getX(i + 2));
          newIndices.push(index.getX(i + 1));
          newIndices.push(index.getX(i));
        }
      }
    }
    if (newIndices.length / 3 !== numberOfTriangles) {
      console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    }
    const newGeometry = geometry2.clone();
    newGeometry.setIndex(newIndices);
    newGeometry.clearGroups();
    return newGeometry;
  } else {
    console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", drawMode);
    return geometry2;
  }
}
class GLTFLoader extends Loader {
  constructor(manager) {
    super(manager);
    this.dracoLoader = null;
    this.ktx2Loader = null;
    this.meshoptDecoder = null;
    this.pluginCallbacks = [];
    this.register(function(parser) {
      return new GLTFMaterialsClearcoatExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsDispersionExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFTextureBasisUExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFTextureWebPExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFTextureAVIFExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsSheenExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsTransmissionExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsVolumeExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsIorExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsEmissiveStrengthExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsSpecularExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsIridescenceExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsAnisotropyExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsBumpExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFLightsExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMeshoptCompression(parser);
    });
    this.register(function(parser) {
      return new GLTFMeshGpuInstancing(parser);
    });
  }
  load(url, onLoad, onProgress, onError) {
    const scope = this;
    let resourcePath;
    if (this.resourcePath !== "") {
      resourcePath = this.resourcePath;
    } else if (this.path !== "") {
      const relativeUrl = LoaderUtils.extractUrlBase(url);
      resourcePath = LoaderUtils.resolveURL(relativeUrl, this.path);
    } else {
      resourcePath = LoaderUtils.extractUrlBase(url);
    }
    this.manager.itemStart(url);
    const _onError = function(e) {
      if (onError) {
        onError(e);
      } else {
        console.error(e);
      }
      scope.manager.itemError(url);
      scope.manager.itemEnd(url);
    };
    const loader2 = new FileLoader(this.manager);
    loader2.setPath(this.path);
    loader2.setResponseType("arraybuffer");
    loader2.setRequestHeader(this.requestHeader);
    loader2.setWithCredentials(this.withCredentials);
    loader2.load(url, function(data) {
      try {
        scope.parse(data, resourcePath, function(gltf) {
          onLoad(gltf);
          scope.manager.itemEnd(url);
        }, _onError);
      } catch (e) {
        _onError(e);
      }
    }, onProgress, _onError);
  }
  setDRACOLoader(dracoLoader) {
    this.dracoLoader = dracoLoader;
    return this;
  }
  setKTX2Loader(ktx2Loader) {
    this.ktx2Loader = ktx2Loader;
    return this;
  }
  setMeshoptDecoder(meshoptDecoder) {
    this.meshoptDecoder = meshoptDecoder;
    return this;
  }
  register(callback) {
    if (this.pluginCallbacks.indexOf(callback) === -1) {
      this.pluginCallbacks.push(callback);
    }
    return this;
  }
  unregister(callback) {
    if (this.pluginCallbacks.indexOf(callback) !== -1) {
      this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1);
    }
    return this;
  }
  parse(data, path, onLoad, onError) {
    let json;
    const extensions = {};
    const plugins = {};
    const textDecoder = new TextDecoder();
    if (typeof data === "string") {
      json = JSON.parse(data);
    } else if (data instanceof ArrayBuffer) {
      const magic = textDecoder.decode(new Uint8Array(data, 0, 4));
      if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
        try {
          extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data);
        } catch (error) {
          if (onError) onError(error);
          return;
        }
        json = JSON.parse(extensions[EXTENSIONS.KHR_BINARY_GLTF].content);
      } else {
        json = JSON.parse(textDecoder.decode(data));
      }
    } else {
      json = data;
    }
    if (json.asset === void 0 || json.asset.version[0] < 2) {
      if (onError) onError(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const parser = new GLTFParser(json, {
      path: path || this.resourcePath || "",
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });
    parser.fileLoader.setRequestHeader(this.requestHeader);
    for (let i = 0; i < this.pluginCallbacks.length; i++) {
      const plugin = this.pluginCallbacks[i](parser);
      if (!plugin.name) console.error("THREE.GLTFLoader: Invalid plugin found: missing name");
      plugins[plugin.name] = plugin;
      extensions[plugin.name] = true;
    }
    if (json.extensionsUsed) {
      for (let i = 0; i < json.extensionsUsed.length; ++i) {
        const extensionName = json.extensionsUsed[i];
        const extensionsRequired = json.extensionsRequired || [];
        switch (extensionName) {
          case EXTENSIONS.KHR_MATERIALS_UNLIT:
            extensions[extensionName] = new GLTFMaterialsUnlitExtension();
            break;
          case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
            extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader);
            break;
          case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
            extensions[extensionName] = new GLTFTextureTransformExtension();
            break;
          case EXTENSIONS.KHR_MESH_QUANTIZATION:
            extensions[extensionName] = new GLTFMeshQuantizationExtension();
            break;
          default:
            if (extensionsRequired.indexOf(extensionName) >= 0 && plugins[extensionName] === void 0) {
              console.warn('THREE.GLTFLoader: Unknown extension "' + extensionName + '".');
            }
        }
      }
    }
    parser.setExtensions(extensions);
    parser.setPlugins(plugins);
    parser.parse(onLoad, onError);
  }
  parseAsync(data, path) {
    const scope = this;
    return new Promise(function(resolve, reject) {
      scope.parse(data, path, resolve, reject);
    });
  }
}
function GLTFRegistry() {
  let objects = {};
  return {
    get: function(key) {
      return objects[key];
    },
    add: function(key, object) {
      objects[key] = object;
    },
    remove: function(key) {
      delete objects[key];
    },
    removeAll: function() {
      objects = {};
    }
  };
}
const EXTENSIONS = {
  KHR_BINARY_GLTF: "KHR_binary_glTF",
  KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
  KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
  KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
  KHR_MATERIALS_DISPERSION: "KHR_materials_dispersion",
  KHR_MATERIALS_IOR: "KHR_materials_ior",
  KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
  KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
  KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
  KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
  KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy",
  KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
  KHR_MATERIALS_VOLUME: "KHR_materials_volume",
  KHR_TEXTURE_BASISU: "KHR_texture_basisu",
  KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
  KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
  KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
  EXT_MATERIALS_BUMP: "EXT_materials_bump",
  EXT_TEXTURE_WEBP: "EXT_texture_webp",
  EXT_TEXTURE_AVIF: "EXT_texture_avif",
  EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
  EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
};
class GLTFLightsExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;
    this.cache = { refs: {}, uses: {} };
  }
  _markDefs() {
    const parser = this.parser;
    const nodeDefs = this.parser.json.nodes || [];
    for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
      const nodeDef = nodeDefs[nodeIndex];
      if (nodeDef.extensions && nodeDef.extensions[this.name] && nodeDef.extensions[this.name].light !== void 0) {
        parser._addNodeRef(this.cache, nodeDef.extensions[this.name].light);
      }
    }
  }
  _loadLight(lightIndex) {
    const parser = this.parser;
    const cacheKey = "light:" + lightIndex;
    let dependency = parser.cache.get(cacheKey);
    if (dependency) return dependency;
    const json = parser.json;
    const extensions = json.extensions && json.extensions[this.name] || {};
    const lightDefs = extensions.lights || [];
    const lightDef = lightDefs[lightIndex];
    let lightNode;
    const color = new Color(16777215);
    if (lightDef.color !== void 0) color.setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2], LinearSRGBColorSpace);
    const range = lightDef.range !== void 0 ? lightDef.range : 0;
    switch (lightDef.type) {
      case "directional":
        lightNode = new DirectionalLight(color);
        lightNode.target.position.set(0, 0, -1);
        lightNode.add(lightNode.target);
        break;
      case "point":
        lightNode = new PointLight(color);
        lightNode.distance = range;
        break;
      case "spot":
        lightNode = new SpotLight(color);
        lightNode.distance = range;
        lightDef.spot = lightDef.spot || {};
        lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== void 0 ? lightDef.spot.innerConeAngle : 0;
        lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== void 0 ? lightDef.spot.outerConeAngle : Math.PI / 4;
        lightNode.angle = lightDef.spot.outerConeAngle;
        lightNode.penumbra = 1 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
        lightNode.target.position.set(0, 0, -1);
        lightNode.add(lightNode.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + lightDef.type);
    }
    lightNode.position.set(0, 0, 0);
    lightNode.decay = 2;
    assignExtrasToUserData(lightNode, lightDef);
    if (lightDef.intensity !== void 0) lightNode.intensity = lightDef.intensity;
    lightNode.name = parser.createUniqueName(lightDef.name || "light_" + lightIndex);
    dependency = Promise.resolve(lightNode);
    parser.cache.add(cacheKey, dependency);
    return dependency;
  }
  getDependency(type, index) {
    if (type !== "light") return;
    return this._loadLight(index);
  }
  createNodeAttachment(nodeIndex) {
    const self2 = this;
    const parser = this.parser;
    const json = parser.json;
    const nodeDef = json.nodes[nodeIndex];
    const lightDef = nodeDef.extensions && nodeDef.extensions[this.name] || {};
    const lightIndex = lightDef.light;
    if (lightIndex === void 0) return null;
    return this._loadLight(lightIndex).then(function(light) {
      return parser._getNodeRef(self2.cache, lightIndex, light);
    });
  }
}
class GLTFMaterialsUnlitExtension {
  constructor() {
    this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return MeshBasicMaterial;
  }
  extendParams(materialParams, materialDef, parser) {
    const pending = [];
    materialParams.color = new Color(1, 1, 1);
    materialParams.opacity = 1;
    const metallicRoughness = materialDef.pbrMetallicRoughness;
    if (metallicRoughness) {
      if (Array.isArray(metallicRoughness.baseColorFactor)) {
        const array = metallicRoughness.baseColorFactor;
        materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace);
        materialParams.opacity = array[3];
      }
      if (metallicRoughness.baseColorTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "map", metallicRoughness.baseColorTexture, SRGBColorSpace));
      }
    }
    return Promise.all(pending);
  }
}
class GLTFMaterialsEmissiveStrengthExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }
    const emissiveStrength = materialDef.extensions[this.name].emissiveStrength;
    if (emissiveStrength !== void 0) {
      materialParams.emissiveIntensity = emissiveStrength;
    }
    return Promise.resolve();
  }
}
class GLTFMaterialsClearcoatExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(materialIndex) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
    return MeshPhysicalMaterial;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }
    const pending = [];
    const extension = materialDef.extensions[this.name];
    if (extension.clearcoatFactor !== void 0) {
      materialParams.clearcoat = extension.clearcoatFactor;
    }
    if (extension.clearcoatTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "clearcoatMap", extension.clearcoatTexture));
    }
    if (extension.clearcoatRoughnessFactor !== void 0) {
      materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;
    }
    if (extension.clearcoatRoughnessTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "clearcoatRoughnessMap", extension.clearcoatRoughnessTexture));
    }
    if (extension.clearcoatNormalTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "clearcoatNormalMap", extension.clearcoatNormalTexture));
      if (extension.clearcoatNormalTexture.scale !== void 0) {
        const scale = extension.clearcoatNormalTexture.scale;
        materialParams.clearcoatNormalScale = new Vector2(scale, scale);
      }
    }
    return Promise.all(pending);
  }
}
class GLTFMaterialsDispersionExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(materialIndex) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
    return MeshPhysicalMaterial;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }
    const extension = materialDef.extensions[this.name];
    materialParams.dispersion = extension.dispersion !== void 0 ? extension.dispersion : 0;
    return Promise.resolve();
  }
}
class GLTFMaterialsIridescenceExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(materialIndex) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
    return MeshPhysicalMaterial;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }
    const pending = [];
    const extension = materialDef.extensions[this.name];
    if (extension.iridescenceFactor !== void 0) {
      materialParams.iridescence = extension.iridescenceFactor;
    }
    if (extension.iridescenceTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "iridescenceMap", extension.iridescenceTexture));
    }
    if (extension.iridescenceIor !== void 0) {
      materialParams.iridescenceIOR = extension.iridescenceIor;
    }
    if (materialParams.iridescenceThicknessRange === void 0) {
      materialParams.iridescenceThicknessRange = [100, 400];
    }
    if (extension.iridescenceThicknessMinimum !== void 0) {
      materialParams.iridescenceThicknessRange[0] = extension.iridescenceThicknessMinimum;
    }
    if (extension.iridescenceThicknessMaximum !== void 0) {
      materialParams.iridescenceThicknessRange[1] = extension.iridescenceThicknessMaximum;
    }
    if (extension.iridescenceThicknessTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "iridescenceThicknessMap", extension.iridescenceThicknessTexture));
    }
    return Promise.all(pending);
  }
}
class GLTFMaterialsSheenExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(materialIndex) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
    return MeshPhysicalMaterial;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }
    const pending = [];
    materialParams.sheenColor = new Color(0, 0, 0);
    materialParams.sheenRoughness = 0;
    materialParams.sheen = 1;
    const extension = materialDef.extensions[this.name];
    if (extension.sheenColorFactor !== void 0) {
      const colorFactor = extension.sheenColorFactor;
      materialParams.sheenColor.setRGB(colorFactor[0], colorFactor[1], colorFactor[2], LinearSRGBColorSpace);
    }
    if (extension.sheenRoughnessFactor !== void 0) {
      materialParams.sheenRoughness = extension.sheenRoughnessFactor;
    }
    if (extension.sheenColorTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "sheenColorMap", extension.sheenColorTexture, SRGBColorSpace));
    }
    if (extension.sheenRoughnessTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "sheenRoughnessMap", extension.sheenRoughnessTexture));
    }
    return Promise.all(pending);
  }
}
class GLTFMaterialsTransmissionExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(materialIndex) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
    return MeshPhysicalMaterial;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }
    const pending = [];
    const extension = materialDef.extensions[this.name];
    if (extension.transmissionFactor !== void 0) {
      materialParams.transmission = extension.transmissionFactor;
    }
    if (extension.transmissionTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "transmissionMap", extension.transmissionTexture));
    }
    return Promise.all(pending);
  }
}
class GLTFMaterialsVolumeExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(materialIndex) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
    return MeshPhysicalMaterial;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }
    const pending = [];
    const extension = materialDef.extensions[this.name];
    materialParams.thickness = extension.thicknessFactor !== void 0 ? extension.thicknessFactor : 0;
    if (extension.thicknessTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "thicknessMap", extension.thicknessTexture));
    }
    materialParams.attenuationDistance = extension.attenuationDistance || Infinity;
    const colorArray = extension.attenuationColor || [1, 1, 1];
    materialParams.attenuationColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace);
    return Promise.all(pending);
  }
}
class GLTFMaterialsIorExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_IOR;
  }
  getMaterialType(materialIndex) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
    return MeshPhysicalMaterial;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }
    const extension = materialDef.extensions[this.name];
    materialParams.ior = extension.ior !== void 0 ? extension.ior : 1.5;
    return Promise.resolve();
  }
}
class GLTFMaterialsSpecularExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(materialIndex) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
    return MeshPhysicalMaterial;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }
    const pending = [];
    const extension = materialDef.extensions[this.name];
    materialParams.specularIntensity = extension.specularFactor !== void 0 ? extension.specularFactor : 1;
    if (extension.specularTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "specularIntensityMap", extension.specularTexture));
    }
    const colorArray = extension.specularColorFactor || [1, 1, 1];
    materialParams.specularColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace);
    if (extension.specularColorTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "specularColorMap", extension.specularColorTexture, SRGBColorSpace));
    }
    return Promise.all(pending);
  }
}
class GLTFMaterialsBumpExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.EXT_MATERIALS_BUMP;
  }
  getMaterialType(materialIndex) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
    return MeshPhysicalMaterial;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }
    const pending = [];
    const extension = materialDef.extensions[this.name];
    materialParams.bumpScale = extension.bumpFactor !== void 0 ? extension.bumpFactor : 1;
    if (extension.bumpTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "bumpMap", extension.bumpTexture));
    }
    return Promise.all(pending);
  }
}
class GLTFMaterialsAnisotropyExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(materialIndex) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
    return MeshPhysicalMaterial;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }
    const pending = [];
    const extension = materialDef.extensions[this.name];
    if (extension.anisotropyStrength !== void 0) {
      materialParams.anisotropy = extension.anisotropyStrength;
    }
    if (extension.anisotropyRotation !== void 0) {
      materialParams.anisotropyRotation = extension.anisotropyRotation;
    }
    if (extension.anisotropyTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "anisotropyMap", extension.anisotropyTexture));
    }
    return Promise.all(pending);
  }
}
class GLTFTextureBasisUExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_TEXTURE_BASISU;
  }
  loadTexture(textureIndex) {
    const parser = this.parser;
    const json = parser.json;
    const textureDef = json.textures[textureIndex];
    if (!textureDef.extensions || !textureDef.extensions[this.name]) {
      return null;
    }
    const extension = textureDef.extensions[this.name];
    const loader2 = parser.options.ktx2Loader;
    if (!loader2) {
      if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
        throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      } else {
        return null;
      }
    }
    return parser.loadTextureImage(textureIndex, extension.source, loader2);
  }
}
class GLTFTextureWebPExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.EXT_TEXTURE_WEBP;
    this.isSupported = null;
  }
  loadTexture(textureIndex) {
    const name = this.name;
    const parser = this.parser;
    const json = parser.json;
    const textureDef = json.textures[textureIndex];
    if (!textureDef.extensions || !textureDef.extensions[name]) {
      return null;
    }
    const extension = textureDef.extensions[name];
    const source = json.images[extension.source];
    let loader2 = parser.textureLoader;
    if (source.uri) {
      const handler = parser.options.manager.getHandler(source.uri);
      if (handler !== null) loader2 = handler;
    }
    return this.detectSupport().then(function(isSupported) {
      if (isSupported) return parser.loadTextureImage(textureIndex, extension.source, loader2);
      if (json.extensionsRequired && json.extensionsRequired.indexOf(name) >= 0) {
        throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");
      }
      return parser.loadTexture(textureIndex);
    });
  }
  detectSupport() {
    if (!this.isSupported) {
      this.isSupported = new Promise(function(resolve) {
        const image = new Image();
        image.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA";
        image.onload = image.onerror = function() {
          resolve(image.height === 1);
        };
      });
    }
    return this.isSupported;
  }
}
class GLTFTextureAVIFExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.EXT_TEXTURE_AVIF;
    this.isSupported = null;
  }
  loadTexture(textureIndex) {
    const name = this.name;
    const parser = this.parser;
    const json = parser.json;
    const textureDef = json.textures[textureIndex];
    if (!textureDef.extensions || !textureDef.extensions[name]) {
      return null;
    }
    const extension = textureDef.extensions[name];
    const source = json.images[extension.source];
    let loader2 = parser.textureLoader;
    if (source.uri) {
      const handler = parser.options.manager.getHandler(source.uri);
      if (handler !== null) loader2 = handler;
    }
    return this.detectSupport().then(function(isSupported) {
      if (isSupported) return parser.loadTextureImage(textureIndex, extension.source, loader2);
      if (json.extensionsRequired && json.extensionsRequired.indexOf(name) >= 0) {
        throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");
      }
      return parser.loadTexture(textureIndex);
    });
  }
  detectSupport() {
    if (!this.isSupported) {
      this.isSupported = new Promise(function(resolve) {
        const image = new Image();
        image.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=";
        image.onload = image.onerror = function() {
          resolve(image.height === 1);
        };
      });
    }
    return this.isSupported;
  }
}
class GLTFMeshoptCompression {
  constructor(parser) {
    this.name = EXTENSIONS.EXT_MESHOPT_COMPRESSION;
    this.parser = parser;
  }
  loadBufferView(index) {
    const json = this.parser.json;
    const bufferView = json.bufferViews[index];
    if (bufferView.extensions && bufferView.extensions[this.name]) {
      const extensionDef = bufferView.extensions[this.name];
      const buffer = this.parser.getDependency("buffer", extensionDef.buffer);
      const decoder = this.parser.options.meshoptDecoder;
      if (!decoder || !decoder.supported) {
        if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
          throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        } else {
          return null;
        }
      }
      return buffer.then(function(res) {
        const byteOffset = extensionDef.byteOffset || 0;
        const byteLength = extensionDef.byteLength || 0;
        const count = extensionDef.count;
        const stride = extensionDef.byteStride;
        const source = new Uint8Array(res, byteOffset, byteLength);
        if (decoder.decodeGltfBufferAsync) {
          return decoder.decodeGltfBufferAsync(count, stride, source, extensionDef.mode, extensionDef.filter).then(function(res2) {
            return res2.buffer;
          });
        } else {
          return decoder.ready.then(function() {
            const result = new ArrayBuffer(count * stride);
            decoder.decodeGltfBuffer(new Uint8Array(result), count, stride, source, extensionDef.mode, extensionDef.filter);
            return result;
          });
        }
      });
    } else {
      return null;
    }
  }
}
class GLTFMeshGpuInstancing {
  constructor(parser) {
    this.name = EXTENSIONS.EXT_MESH_GPU_INSTANCING;
    this.parser = parser;
  }
  createNodeMesh(nodeIndex) {
    const json = this.parser.json;
    const nodeDef = json.nodes[nodeIndex];
    if (!nodeDef.extensions || !nodeDef.extensions[this.name] || nodeDef.mesh === void 0) {
      return null;
    }
    const meshDef = json.meshes[nodeDef.mesh];
    for (const primitive of meshDef.primitives) {
      if (primitive.mode !== WEBGL_CONSTANTS.TRIANGLES && primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_STRIP && primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_FAN && primitive.mode !== void 0) {
        return null;
      }
    }
    const extensionDef = nodeDef.extensions[this.name];
    const attributesDef = extensionDef.attributes;
    const pending = [];
    const attributes = {};
    for (const key in attributesDef) {
      pending.push(this.parser.getDependency("accessor", attributesDef[key]).then((accessor) => {
        attributes[key] = accessor;
        return attributes[key];
      }));
    }
    if (pending.length < 1) {
      return null;
    }
    pending.push(this.parser.createNodeMesh(nodeIndex));
    return Promise.all(pending).then((results) => {
      const nodeObject = results.pop();
      const meshes = nodeObject.isGroup ? nodeObject.children : [nodeObject];
      const count = results[0].count;
      const instancedMeshes = [];
      for (const mesh of meshes) {
        const m = new Matrix4();
        const p = new Vector3();
        const q = new Quaternion();
        const s = new Vector3(1, 1, 1);
        const instancedMesh = new InstancedMesh(mesh.geometry, mesh.material, count);
        for (let i = 0; i < count; i++) {
          if (attributes.TRANSLATION) {
            p.fromBufferAttribute(attributes.TRANSLATION, i);
          }
          if (attributes.ROTATION) {
            q.fromBufferAttribute(attributes.ROTATION, i);
          }
          if (attributes.SCALE) {
            s.fromBufferAttribute(attributes.SCALE, i);
          }
          instancedMesh.setMatrixAt(i, m.compose(p, q, s));
        }
        for (const attributeName in attributes) {
          if (attributeName === "_COLOR_0") {
            const attr = attributes[attributeName];
            instancedMesh.instanceColor = new InstancedBufferAttribute(attr.array, attr.itemSize, attr.normalized);
          } else if (attributeName !== "TRANSLATION" && attributeName !== "ROTATION" && attributeName !== "SCALE") {
            mesh.geometry.setAttribute(attributeName, attributes[attributeName]);
          }
        }
        Object3D.prototype.copy.call(instancedMesh, mesh);
        this.parser.assignFinalMaterial(instancedMesh);
        instancedMeshes.push(instancedMesh);
      }
      if (nodeObject.isGroup) {
        nodeObject.clear();
        nodeObject.add(...instancedMeshes);
        return nodeObject;
      }
      return instancedMeshes[0];
    });
  }
}
const BINARY_EXTENSION_HEADER_MAGIC = "glTF";
const BINARY_EXTENSION_HEADER_LENGTH = 12;
const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 1313821514, BIN: 5130562 };
class GLTFBinaryExtension {
  constructor(data) {
    this.name = EXTENSIONS.KHR_BINARY_GLTF;
    this.content = null;
    this.body = null;
    const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);
    const textDecoder = new TextDecoder();
    this.header = {
      magic: textDecoder.decode(new Uint8Array(data.slice(0, 4))),
      version: headerView.getUint32(4, true),
      length: headerView.getUint32(8, true)
    };
    if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    } else if (this.header.version < 2) {
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    }
    const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH;
    const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
    let chunkIndex = 0;
    while (chunkIndex < chunkContentsLength) {
      const chunkLength = chunkView.getUint32(chunkIndex, true);
      chunkIndex += 4;
      const chunkType = chunkView.getUint32(chunkIndex, true);
      chunkIndex += 4;
      if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
        const contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
        this.content = textDecoder.decode(contentArray);
      } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
        const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
        this.body = data.slice(byteOffset, byteOffset + chunkLength);
      }
      chunkIndex += chunkLength;
    }
    if (this.content === null) {
      throw new Error("THREE.GLTFLoader: JSON content not found.");
    }
  }
}
class GLTFDracoMeshCompressionExtension {
  constructor(json, dracoLoader) {
    if (!dracoLoader) {
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    }
    this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
    this.json = json;
    this.dracoLoader = dracoLoader;
    this.dracoLoader.preload();
  }
  decodePrimitive(primitive, parser) {
    const json = this.json;
    const dracoLoader = this.dracoLoader;
    const bufferViewIndex = primitive.extensions[this.name].bufferView;
    const gltfAttributeMap = primitive.extensions[this.name].attributes;
    const threeAttributeMap = {};
    const attributeNormalizedMap = {};
    const attributeTypeMap = {};
    for (const attributeName in gltfAttributeMap) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
      threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName];
    }
    for (const attributeName in primitive.attributes) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
      if (gltfAttributeMap[attributeName] !== void 0) {
        const accessorDef = json.accessors[primitive.attributes[attributeName]];
        const componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
        attributeTypeMap[threeAttributeName] = componentType.name;
        attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true;
      }
    }
    return parser.getDependency("bufferView", bufferViewIndex).then(function(bufferView) {
      return new Promise(function(resolve, reject) {
        dracoLoader.decodeDracoFile(bufferView, function(geometry2) {
          for (const attributeName in geometry2.attributes) {
            const attribute = geometry2.attributes[attributeName];
            const normalized = attributeNormalizedMap[attributeName];
            if (normalized !== void 0) attribute.normalized = normalized;
          }
          resolve(geometry2);
        }, threeAttributeMap, attributeTypeMap, LinearSRGBColorSpace, reject);
      });
    });
  }
}
class GLTFTextureTransformExtension {
  constructor() {
    this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(texture, transform) {
    if ((transform.texCoord === void 0 || transform.texCoord === texture.channel) && transform.offset === void 0 && transform.rotation === void 0 && transform.scale === void 0) {
      return texture;
    }
    texture = texture.clone();
    if (transform.texCoord !== void 0) {
      texture.channel = transform.texCoord;
    }
    if (transform.offset !== void 0) {
      texture.offset.fromArray(transform.offset);
    }
    if (transform.rotation !== void 0) {
      texture.rotation = transform.rotation;
    }
    if (transform.scale !== void 0) {
      texture.repeat.fromArray(transform.scale);
    }
    texture.needsUpdate = true;
    return texture;
  }
}
class GLTFMeshQuantizationExtension {
  constructor() {
    this.name = EXTENSIONS.KHR_MESH_QUANTIZATION;
  }
}
class GLTFCubicSplineInterpolant extends Interpolant {
  constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);
  }
  copySampleValue_(index) {
    const result = this.resultBuffer, values = this.sampleValues, valueSize = this.valueSize, offset = index * valueSize * 3 + valueSize;
    for (let i = 0; i !== valueSize; i++) {
      result[i] = values[offset + i];
    }
    return result;
  }
  interpolate_(i1, t0, t, t1) {
    const result = this.resultBuffer;
    const values = this.sampleValues;
    const stride = this.valueSize;
    const stride2 = stride * 2;
    const stride3 = stride * 3;
    const td = t1 - t0;
    const p = (t - t0) / td;
    const pp = p * p;
    const ppp = pp * p;
    const offset1 = i1 * stride3;
    const offset0 = offset1 - stride3;
    const s2 = -2 * ppp + 3 * pp;
    const s3 = ppp - pp;
    const s0 = 1 - s2;
    const s1 = s3 - pp + p;
    for (let i = 0; i !== stride; i++) {
      const p0 = values[offset0 + i + stride];
      const m0 = values[offset0 + i + stride2] * td;
      const p1 = values[offset1 + i + stride];
      const m1 = values[offset1 + i] * td;
      result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;
    }
    return result;
  }
}
const _q = new Quaternion();
class GLTFCubicSplineQuaternionInterpolant extends GLTFCubicSplineInterpolant {
  interpolate_(i1, t0, t, t1) {
    const result = super.interpolate_(i1, t0, t, t1);
    _q.fromArray(result).normalize().toArray(result);
    return result;
  }
}
const WEBGL_CONSTANTS = {
  FLOAT: 5126,
  //FLOAT_MAT2: 35674,
  FLOAT_MAT3: 35675,
  FLOAT_MAT4: 35676,
  FLOAT_VEC2: 35664,
  FLOAT_VEC3: 35665,
  FLOAT_VEC4: 35666,
  LINEAR: 9729,
  REPEAT: 10497,
  SAMPLER_2D: 35678,
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6,
  UNSIGNED_BYTE: 5121,
  UNSIGNED_SHORT: 5123
};
const WEBGL_COMPONENT_TYPES = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
};
const WEBGL_FILTERS = {
  9728: NearestFilter,
  9729: LinearFilter,
  9984: NearestMipmapNearestFilter,
  9985: LinearMipmapNearestFilter,
  9986: NearestMipmapLinearFilter,
  9987: LinearMipmapLinearFilter
};
const WEBGL_WRAPPINGS = {
  33071: ClampToEdgeWrapping,
  33648: MirroredRepeatWrapping,
  10497: RepeatWrapping
};
const WEBGL_TYPE_SIZES = {
  "SCALAR": 1,
  "VEC2": 2,
  "VEC3": 3,
  "VEC4": 4,
  "MAT2": 4,
  "MAT3": 9,
  "MAT4": 16
};
const ATTRIBUTES = {
  POSITION: "position",
  NORMAL: "normal",
  TANGENT: "tangent",
  TEXCOORD_0: "uv",
  TEXCOORD_1: "uv1",
  TEXCOORD_2: "uv2",
  TEXCOORD_3: "uv3",
  COLOR_0: "color",
  WEIGHTS_0: "skinWeight",
  JOINTS_0: "skinIndex"
};
const PATH_PROPERTIES = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
};
const INTERPOLATION = {
  CUBICSPLINE: void 0,
  // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: InterpolateLinear,
  STEP: InterpolateDiscrete
};
const ALPHA_MODES = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function createDefaultMaterial(cache) {
  if (cache["DefaultMaterial"] === void 0) {
    cache["DefaultMaterial"] = new MeshStandardMaterial({
      color: 16777215,
      emissive: 0,
      metalness: 1,
      roughness: 1,
      transparent: false,
      depthTest: true,
      side: FrontSide
    });
  }
  return cache["DefaultMaterial"];
}
function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {
  for (const name in objectDef.extensions) {
    if (knownExtensions[name] === void 0) {
      object.userData.gltfExtensions = object.userData.gltfExtensions || {};
      object.userData.gltfExtensions[name] = objectDef.extensions[name];
    }
  }
}
function assignExtrasToUserData(object, gltfDef) {
  if (gltfDef.extras !== void 0) {
    if (typeof gltfDef.extras === "object") {
      Object.assign(object.userData, gltfDef.extras);
    } else {
      console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + gltfDef.extras);
    }
  }
}
function addMorphTargets(geometry2, targets, parser) {
  let hasMorphPosition = false;
  let hasMorphNormal = false;
  let hasMorphColor = false;
  for (let i = 0, il = targets.length; i < il; i++) {
    const target = targets[i];
    if (target.POSITION !== void 0) hasMorphPosition = true;
    if (target.NORMAL !== void 0) hasMorphNormal = true;
    if (target.COLOR_0 !== void 0) hasMorphColor = true;
    if (hasMorphPosition && hasMorphNormal && hasMorphColor) break;
  }
  if (!hasMorphPosition && !hasMorphNormal && !hasMorphColor) return Promise.resolve(geometry2);
  const pendingPositionAccessors = [];
  const pendingNormalAccessors = [];
  const pendingColorAccessors = [];
  for (let i = 0, il = targets.length; i < il; i++) {
    const target = targets[i];
    if (hasMorphPosition) {
      const pendingAccessor = target.POSITION !== void 0 ? parser.getDependency("accessor", target.POSITION) : geometry2.attributes.position;
      pendingPositionAccessors.push(pendingAccessor);
    }
    if (hasMorphNormal) {
      const pendingAccessor = target.NORMAL !== void 0 ? parser.getDependency("accessor", target.NORMAL) : geometry2.attributes.normal;
      pendingNormalAccessors.push(pendingAccessor);
    }
    if (hasMorphColor) {
      const pendingAccessor = target.COLOR_0 !== void 0 ? parser.getDependency("accessor", target.COLOR_0) : geometry2.attributes.color;
      pendingColorAccessors.push(pendingAccessor);
    }
  }
  return Promise.all([
    Promise.all(pendingPositionAccessors),
    Promise.all(pendingNormalAccessors),
    Promise.all(pendingColorAccessors)
  ]).then(function(accessors) {
    const morphPositions = accessors[0];
    const morphNormals = accessors[1];
    const morphColors = accessors[2];
    if (hasMorphPosition) geometry2.morphAttributes.position = morphPositions;
    if (hasMorphNormal) geometry2.morphAttributes.normal = morphNormals;
    if (hasMorphColor) geometry2.morphAttributes.color = morphColors;
    geometry2.morphTargetsRelative = true;
    return geometry2;
  });
}
function updateMorphTargets(mesh, meshDef) {
  mesh.updateMorphTargets();
  if (meshDef.weights !== void 0) {
    for (let i = 0, il = meshDef.weights.length; i < il; i++) {
      mesh.morphTargetInfluences[i] = meshDef.weights[i];
    }
  }
  if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
    const targetNames = meshDef.extras.targetNames;
    if (mesh.morphTargetInfluences.length === targetNames.length) {
      mesh.morphTargetDictionary = {};
      for (let i = 0, il = targetNames.length; i < il; i++) {
        mesh.morphTargetDictionary[targetNames[i]] = i;
      }
    } else {
      console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
    }
  }
}
function createPrimitiveKey(primitiveDef) {
  let geometryKey;
  const dracoExtension = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];
  if (dracoExtension) {
    geometryKey = "draco:" + dracoExtension.bufferView + ":" + dracoExtension.indices + ":" + createAttributesKey(dracoExtension.attributes);
  } else {
    geometryKey = primitiveDef.indices + ":" + createAttributesKey(primitiveDef.attributes) + ":" + primitiveDef.mode;
  }
  if (primitiveDef.targets !== void 0) {
    for (let i = 0, il = primitiveDef.targets.length; i < il; i++) {
      geometryKey += ":" + createAttributesKey(primitiveDef.targets[i]);
    }
  }
  return geometryKey;
}
function createAttributesKey(attributes) {
  let attributesKey = "";
  const keys = Object.keys(attributes).sort();
  for (let i = 0, il = keys.length; i < il; i++) {
    attributesKey += keys[i] + ":" + attributes[keys[i]] + ";";
  }
  return attributesKey;
}
function getNormalizedComponentScale(constructor) {
  switch (constructor) {
    case Int8Array:
      return 1 / 127;
    case Uint8Array:
      return 1 / 255;
    case Int16Array:
      return 1 / 32767;
    case Uint16Array:
      return 1 / 65535;
    default:
      throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
  }
}
function getImageURIMimeType(uri) {
  if (uri.search(/\.jpe?g($|\?)/i) > 0 || uri.search(/^data\:image\/jpeg/) === 0) return "image/jpeg";
  if (uri.search(/\.webp($|\?)/i) > 0 || uri.search(/^data\:image\/webp/) === 0) return "image/webp";
  if (uri.search(/\.ktx2($|\?)/i) > 0 || uri.search(/^data\:image\/ktx2/) === 0) return "image/ktx2";
  return "image/png";
}
const _identityMatrix = new Matrix4();
class GLTFParser {
  constructor(json = {}, options = {}) {
    this.json = json;
    this.extensions = {};
    this.plugins = {};
    this.options = options;
    this.cache = new GLTFRegistry();
    this.associations = /* @__PURE__ */ new Map();
    this.primitiveCache = {};
    this.nodeCache = {};
    this.meshCache = { refs: {}, uses: {} };
    this.cameraCache = { refs: {}, uses: {} };
    this.lightCache = { refs: {}, uses: {} };
    this.sourceCache = {};
    this.textureCache = {};
    this.nodeNamesUsed = {};
    let isSafari = false;
    let safariVersion = -1;
    let isFirefox = false;
    let firefoxVersion = -1;
    if (typeof navigator !== "undefined") {
      const userAgent = navigator.userAgent;
      isSafari = /^((?!chrome|android).)*safari/i.test(userAgent) === true;
      const safariMatch = userAgent.match(/Version\/(\d+)/);
      safariVersion = isSafari && safariMatch ? parseInt(safariMatch[1], 10) : -1;
      isFirefox = userAgent.indexOf("Firefox") > -1;
      firefoxVersion = isFirefox ? userAgent.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    if (typeof createImageBitmap === "undefined" || isSafari && safariVersion < 17 || isFirefox && firefoxVersion < 98) {
      this.textureLoader = new TextureLoader(this.options.manager);
    } else {
      this.textureLoader = new ImageBitmapLoader(this.options.manager);
    }
    this.textureLoader.setCrossOrigin(this.options.crossOrigin);
    this.textureLoader.setRequestHeader(this.options.requestHeader);
    this.fileLoader = new FileLoader(this.options.manager);
    this.fileLoader.setResponseType("arraybuffer");
    if (this.options.crossOrigin === "use-credentials") {
      this.fileLoader.setWithCredentials(true);
    }
  }
  setExtensions(extensions) {
    this.extensions = extensions;
  }
  setPlugins(plugins) {
    this.plugins = plugins;
  }
  parse(onLoad, onError) {
    const parser = this;
    const json = this.json;
    const extensions = this.extensions;
    this.cache.removeAll();
    this.nodeCache = {};
    this._invokeAll(function(ext) {
      return ext._markDefs && ext._markDefs();
    });
    Promise.all(this._invokeAll(function(ext) {
      return ext.beforeRoot && ext.beforeRoot();
    })).then(function() {
      return Promise.all([
        parser.getDependencies("scene"),
        parser.getDependencies("animation"),
        parser.getDependencies("camera")
      ]);
    }).then(function(dependencies) {
      const result = {
        scene: dependencies[0][json.scene || 0],
        scenes: dependencies[0],
        animations: dependencies[1],
        cameras: dependencies[2],
        asset: json.asset,
        parser,
        userData: {}
      };
      addUnknownExtensionsToUserData(extensions, result, json);
      assignExtrasToUserData(result, json);
      return Promise.all(parser._invokeAll(function(ext) {
        return ext.afterRoot && ext.afterRoot(result);
      })).then(function() {
        for (const scene2 of result.scenes) {
          scene2.updateMatrixWorld();
        }
        onLoad(result);
      });
    }).catch(onError);
  }
  /**
   * Marks the special nodes/meshes in json for efficient parse.
   */
  _markDefs() {
    const nodeDefs = this.json.nodes || [];
    const skinDefs = this.json.skins || [];
    const meshDefs = this.json.meshes || [];
    for (let skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {
      const joints = skinDefs[skinIndex].joints;
      for (let i = 0, il = joints.length; i < il; i++) {
        nodeDefs[joints[i]].isBone = true;
      }
    }
    for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
      const nodeDef = nodeDefs[nodeIndex];
      if (nodeDef.mesh !== void 0) {
        this._addNodeRef(this.meshCache, nodeDef.mesh);
        if (nodeDef.skin !== void 0) {
          meshDefs[nodeDef.mesh].isSkinnedMesh = true;
        }
      }
      if (nodeDef.camera !== void 0) {
        this._addNodeRef(this.cameraCache, nodeDef.camera);
      }
    }
  }
  /**
   * Counts references to shared node / Object3D resources. These resources
   * can be reused, or "instantiated", at multiple nodes in the scene
   * hierarchy. Mesh, Camera, and Light instances are instantiated and must
   * be marked. Non-scenegraph resources (like Materials, Geometries, and
   * Textures) can be reused directly and are not marked here.
   *
   * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
   */
  _addNodeRef(cache, index) {
    if (index === void 0) return;
    if (cache.refs[index] === void 0) {
      cache.refs[index] = cache.uses[index] = 0;
    }
    cache.refs[index]++;
  }
  /** Returns a reference to a shared resource, cloning it if necessary. */
  _getNodeRef(cache, index, object) {
    if (cache.refs[index] <= 1) return object;
    const ref = object.clone();
    const updateMappings = (original, clone) => {
      const mappings = this.associations.get(original);
      if (mappings != null) {
        this.associations.set(clone, mappings);
      }
      for (const [i, child] of original.children.entries()) {
        updateMappings(child, clone.children[i]);
      }
    };
    updateMappings(object, ref);
    ref.name += "_instance_" + cache.uses[index]++;
    return ref;
  }
  _invokeOne(func) {
    const extensions = Object.values(this.plugins);
    extensions.push(this);
    for (let i = 0; i < extensions.length; i++) {
      const result = func(extensions[i]);
      if (result) return result;
    }
    return null;
  }
  _invokeAll(func) {
    const extensions = Object.values(this.plugins);
    extensions.unshift(this);
    const pending = [];
    for (let i = 0; i < extensions.length; i++) {
      const result = func(extensions[i]);
      if (result) pending.push(result);
    }
    return pending;
  }
  /**
   * Requests the specified dependency asynchronously, with caching.
   * @param {string} type
   * @param {number} index
   * @return {Promise<Object3D|Material|THREE.Texture|AnimationClip|ArrayBuffer|Object>}
   */
  getDependency(type, index) {
    const cacheKey = type + ":" + index;
    let dependency = this.cache.get(cacheKey);
    if (!dependency) {
      switch (type) {
        case "scene":
          dependency = this.loadScene(index);
          break;
        case "node":
          dependency = this._invokeOne(function(ext) {
            return ext.loadNode && ext.loadNode(index);
          });
          break;
        case "mesh":
          dependency = this._invokeOne(function(ext) {
            return ext.loadMesh && ext.loadMesh(index);
          });
          break;
        case "accessor":
          dependency = this.loadAccessor(index);
          break;
        case "bufferView":
          dependency = this._invokeOne(function(ext) {
            return ext.loadBufferView && ext.loadBufferView(index);
          });
          break;
        case "buffer":
          dependency = this.loadBuffer(index);
          break;
        case "material":
          dependency = this._invokeOne(function(ext) {
            return ext.loadMaterial && ext.loadMaterial(index);
          });
          break;
        case "texture":
          dependency = this._invokeOne(function(ext) {
            return ext.loadTexture && ext.loadTexture(index);
          });
          break;
        case "skin":
          dependency = this.loadSkin(index);
          break;
        case "animation":
          dependency = this._invokeOne(function(ext) {
            return ext.loadAnimation && ext.loadAnimation(index);
          });
          break;
        case "camera":
          dependency = this.loadCamera(index);
          break;
        default:
          dependency = this._invokeOne(function(ext) {
            return ext != this && ext.getDependency && ext.getDependency(type, index);
          });
          if (!dependency) {
            throw new Error("Unknown type: " + type);
          }
          break;
      }
      this.cache.add(cacheKey, dependency);
    }
    return dependency;
  }
  /**
   * Requests all dependencies of the specified type asynchronously, with caching.
   * @param {string} type
   * @return {Promise<Array<Object>>}
   */
  getDependencies(type) {
    let dependencies = this.cache.get(type);
    if (!dependencies) {
      const parser = this;
      const defs = this.json[type + (type === "mesh" ? "es" : "s")] || [];
      dependencies = Promise.all(defs.map(function(def, index) {
        return parser.getDependency(type, index);
      }));
      this.cache.add(type, dependencies);
    }
    return dependencies;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   * @param {number} bufferIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBuffer(bufferIndex) {
    const bufferDef = this.json.buffers[bufferIndex];
    const loader2 = this.fileLoader;
    if (bufferDef.type && bufferDef.type !== "arraybuffer") {
      throw new Error("THREE.GLTFLoader: " + bufferDef.type + " buffer type is not supported.");
    }
    if (bufferDef.uri === void 0 && bufferIndex === 0) {
      return Promise.resolve(this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body);
    }
    const options = this.options;
    return new Promise(function(resolve, reject) {
      loader2.load(LoaderUtils.resolveURL(bufferDef.uri, options.path), resolve, void 0, function() {
        reject(new Error('THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".'));
      });
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   * @param {number} bufferViewIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBufferView(bufferViewIndex) {
    const bufferViewDef = this.json.bufferViews[bufferViewIndex];
    return this.getDependency("buffer", bufferViewDef.buffer).then(function(buffer) {
      const byteLength = bufferViewDef.byteLength || 0;
      const byteOffset = bufferViewDef.byteOffset || 0;
      return buffer.slice(byteOffset, byteOffset + byteLength);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
   * @param {number} accessorIndex
   * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
   */
  loadAccessor(accessorIndex) {
    const parser = this;
    const json = this.json;
    const accessorDef = this.json.accessors[accessorIndex];
    if (accessorDef.bufferView === void 0 && accessorDef.sparse === void 0) {
      const itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
      const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
      const normalized = accessorDef.normalized === true;
      const array = new TypedArray(accessorDef.count * itemSize);
      return Promise.resolve(new BufferAttribute(array, itemSize, normalized));
    }
    const pendingBufferViews = [];
    if (accessorDef.bufferView !== void 0) {
      pendingBufferViews.push(this.getDependency("bufferView", accessorDef.bufferView));
    } else {
      pendingBufferViews.push(null);
    }
    if (accessorDef.sparse !== void 0) {
      pendingBufferViews.push(this.getDependency("bufferView", accessorDef.sparse.indices.bufferView));
      pendingBufferViews.push(this.getDependency("bufferView", accessorDef.sparse.values.bufferView));
    }
    return Promise.all(pendingBufferViews).then(function(bufferViews) {
      const bufferView = bufferViews[0];
      const itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
      const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
      const elementBytes = TypedArray.BYTES_PER_ELEMENT;
      const itemBytes = elementBytes * itemSize;
      const byteOffset = accessorDef.byteOffset || 0;
      const byteStride = accessorDef.bufferView !== void 0 ? json.bufferViews[accessorDef.bufferView].byteStride : void 0;
      const normalized = accessorDef.normalized === true;
      let array, bufferAttribute;
      if (byteStride && byteStride !== itemBytes) {
        const ibSlice = Math.floor(byteOffset / byteStride);
        const ibCacheKey = "InterleavedBuffer:" + accessorDef.bufferView + ":" + accessorDef.componentType + ":" + ibSlice + ":" + accessorDef.count;
        let ib = parser.cache.get(ibCacheKey);
        if (!ib) {
          array = new TypedArray(bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes);
          ib = new InterleavedBuffer(array, byteStride / elementBytes);
          parser.cache.add(ibCacheKey, ib);
        }
        bufferAttribute = new InterleavedBufferAttribute(ib, itemSize, byteOffset % byteStride / elementBytes, normalized);
      } else {
        if (bufferView === null) {
          array = new TypedArray(accessorDef.count * itemSize);
        } else {
          array = new TypedArray(bufferView, byteOffset, accessorDef.count * itemSize);
        }
        bufferAttribute = new BufferAttribute(array, itemSize, normalized);
      }
      if (accessorDef.sparse !== void 0) {
        const itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
        const TypedArrayIndices = WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType];
        const byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
        const byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;
        const sparseIndices = new TypedArrayIndices(bufferViews[1], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices);
        const sparseValues = new TypedArray(bufferViews[2], byteOffsetValues, accessorDef.sparse.count * itemSize);
        if (bufferView !== null) {
          bufferAttribute = new BufferAttribute(bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized);
        }
        bufferAttribute.normalized = false;
        for (let i = 0, il = sparseIndices.length; i < il; i++) {
          const index = sparseIndices[i];
          bufferAttribute.setX(index, sparseValues[i * itemSize]);
          if (itemSize >= 2) bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
          if (itemSize >= 3) bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
          if (itemSize >= 4) bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
          if (itemSize >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
        }
        bufferAttribute.normalized = normalized;
      }
      return bufferAttribute;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
   * @param {number} textureIndex
   * @return {Promise<THREE.Texture|null>}
   */
  loadTexture(textureIndex) {
    const json = this.json;
    const options = this.options;
    const textureDef = json.textures[textureIndex];
    const sourceIndex = textureDef.source;
    const sourceDef = json.images[sourceIndex];
    let loader2 = this.textureLoader;
    if (sourceDef.uri) {
      const handler = options.manager.getHandler(sourceDef.uri);
      if (handler !== null) loader2 = handler;
    }
    return this.loadTextureImage(textureIndex, sourceIndex, loader2);
  }
  loadTextureImage(textureIndex, sourceIndex, loader2) {
    const parser = this;
    const json = this.json;
    const textureDef = json.textures[textureIndex];
    const sourceDef = json.images[sourceIndex];
    const cacheKey = (sourceDef.uri || sourceDef.bufferView) + ":" + textureDef.sampler;
    if (this.textureCache[cacheKey]) {
      return this.textureCache[cacheKey];
    }
    const promise = this.loadImageSource(sourceIndex, loader2).then(function(texture) {
      texture.flipY = false;
      texture.name = textureDef.name || sourceDef.name || "";
      if (texture.name === "" && typeof sourceDef.uri === "string" && sourceDef.uri.startsWith("data:image/") === false) {
        texture.name = sourceDef.uri;
      }
      const samplers = json.samplers || {};
      const sampler = samplers[textureDef.sampler] || {};
      texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || LinearFilter;
      texture.minFilter = WEBGL_FILTERS[sampler.minFilter] || LinearMipmapLinearFilter;
      texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || RepeatWrapping;
      texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || RepeatWrapping;
      texture.generateMipmaps = !texture.isCompressedTexture && texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter;
      parser.associations.set(texture, { textures: textureIndex });
      return texture;
    }).catch(function() {
      return null;
    });
    this.textureCache[cacheKey] = promise;
    return promise;
  }
  loadImageSource(sourceIndex, loader2) {
    const parser = this;
    const json = this.json;
    const options = this.options;
    if (this.sourceCache[sourceIndex] !== void 0) {
      return this.sourceCache[sourceIndex].then((texture) => texture.clone());
    }
    const sourceDef = json.images[sourceIndex];
    const URL = self.URL || self.webkitURL;
    let sourceURI = sourceDef.uri || "";
    let isObjectURL = false;
    if (sourceDef.bufferView !== void 0) {
      sourceURI = parser.getDependency("bufferView", sourceDef.bufferView).then(function(bufferView) {
        isObjectURL = true;
        const blob = new Blob([bufferView], { type: sourceDef.mimeType });
        sourceURI = URL.createObjectURL(blob);
        return sourceURI;
      });
    } else if (sourceDef.uri === void 0) {
      throw new Error("THREE.GLTFLoader: Image " + sourceIndex + " is missing URI and bufferView");
    }
    const promise = Promise.resolve(sourceURI).then(function(sourceURI2) {
      return new Promise(function(resolve, reject) {
        let onLoad = resolve;
        if (loader2.isImageBitmapLoader === true) {
          onLoad = function(imageBitmap) {
            const texture = new Texture(imageBitmap);
            texture.needsUpdate = true;
            resolve(texture);
          };
        }
        loader2.load(LoaderUtils.resolveURL(sourceURI2, options.path), onLoad, void 0, reject);
      });
    }).then(function(texture) {
      if (isObjectURL === true) {
        URL.revokeObjectURL(sourceURI);
      }
      assignExtrasToUserData(texture, sourceDef);
      texture.userData.mimeType = sourceDef.mimeType || getImageURIMimeType(sourceDef.uri);
      return texture;
    }).catch(function(error) {
      console.error("THREE.GLTFLoader: Couldn't load texture", sourceURI);
      throw error;
    });
    this.sourceCache[sourceIndex] = promise;
    return promise;
  }
  /**
   * Asynchronously assigns a texture to the given material parameters.
   * @param {Object} materialParams
   * @param {string} mapName
   * @param {Object} mapDef
   * @return {Promise<Texture>}
   */
  assignTexture(materialParams, mapName, mapDef, colorSpace) {
    const parser = this;
    return this.getDependency("texture", mapDef.index).then(function(texture) {
      if (!texture) return null;
      if (mapDef.texCoord !== void 0 && mapDef.texCoord > 0) {
        texture = texture.clone();
        texture.channel = mapDef.texCoord;
      }
      if (parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {
        const transform = mapDef.extensions !== void 0 ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] : void 0;
        if (transform) {
          const gltfReference = parser.associations.get(texture);
          texture = parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM].extendTexture(texture, transform);
          parser.associations.set(texture, gltfReference);
        }
      }
      if (colorSpace !== void 0) {
        texture.colorSpace = colorSpace;
      }
      materialParams[mapName] = texture;
      return texture;
    });
  }
  /**
   * Assigns final material to a Mesh, Line, or Points instance. The instance
   * already has a material (generated from the glTF material options alone)
   * but reuse of the same glTF material may require multiple threejs materials
   * to accommodate different primitive types, defines, etc. New materials will
   * be created if necessary, and reused from a cache.
   * @param  {Object3D} mesh Mesh, Line, or Points instance.
   */
  assignFinalMaterial(mesh) {
    const geometry2 = mesh.geometry;
    let material2 = mesh.material;
    const useDerivativeTangents = geometry2.attributes.tangent === void 0;
    const useVertexColors = geometry2.attributes.color !== void 0;
    const useFlatShading = geometry2.attributes.normal === void 0;
    if (mesh.isPoints) {
      const cacheKey = "PointsMaterial:" + material2.uuid;
      let pointsMaterial = this.cache.get(cacheKey);
      if (!pointsMaterial) {
        pointsMaterial = new PointsMaterial();
        Material.prototype.copy.call(pointsMaterial, material2);
        pointsMaterial.color.copy(material2.color);
        pointsMaterial.map = material2.map;
        pointsMaterial.sizeAttenuation = false;
        this.cache.add(cacheKey, pointsMaterial);
      }
      material2 = pointsMaterial;
    } else if (mesh.isLine) {
      const cacheKey = "LineBasicMaterial:" + material2.uuid;
      let lineMaterial = this.cache.get(cacheKey);
      if (!lineMaterial) {
        lineMaterial = new LineBasicMaterial();
        Material.prototype.copy.call(lineMaterial, material2);
        lineMaterial.color.copy(material2.color);
        lineMaterial.map = material2.map;
        this.cache.add(cacheKey, lineMaterial);
      }
      material2 = lineMaterial;
    }
    if (useDerivativeTangents || useVertexColors || useFlatShading) {
      let cacheKey = "ClonedMaterial:" + material2.uuid + ":";
      if (useDerivativeTangents) cacheKey += "derivative-tangents:";
      if (useVertexColors) cacheKey += "vertex-colors:";
      if (useFlatShading) cacheKey += "flat-shading:";
      let cachedMaterial = this.cache.get(cacheKey);
      if (!cachedMaterial) {
        cachedMaterial = material2.clone();
        if (useVertexColors) cachedMaterial.vertexColors = true;
        if (useFlatShading) cachedMaterial.flatShading = true;
        if (useDerivativeTangents) {
          if (cachedMaterial.normalScale) cachedMaterial.normalScale.y *= -1;
          if (cachedMaterial.clearcoatNormalScale) cachedMaterial.clearcoatNormalScale.y *= -1;
        }
        this.cache.add(cacheKey, cachedMaterial);
        this.associations.set(cachedMaterial, this.associations.get(material2));
      }
      material2 = cachedMaterial;
    }
    mesh.material = material2;
  }
  getMaterialType() {
    return MeshStandardMaterial;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
   * @param {number} materialIndex
   * @return {Promise<Material>}
   */
  loadMaterial(materialIndex) {
    const parser = this;
    const json = this.json;
    const extensions = this.extensions;
    const materialDef = json.materials[materialIndex];
    let materialType;
    const materialParams = {};
    const materialExtensions = materialDef.extensions || {};
    const pending = [];
    if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
      const kmuExtension = extensions[EXTENSIONS.KHR_MATERIALS_UNLIT];
      materialType = kmuExtension.getMaterialType();
      pending.push(kmuExtension.extendParams(materialParams, materialDef, parser));
    } else {
      const metallicRoughness = materialDef.pbrMetallicRoughness || {};
      materialParams.color = new Color(1, 1, 1);
      materialParams.opacity = 1;
      if (Array.isArray(metallicRoughness.baseColorFactor)) {
        const array = metallicRoughness.baseColorFactor;
        materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace);
        materialParams.opacity = array[3];
      }
      if (metallicRoughness.baseColorTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "map", metallicRoughness.baseColorTexture, SRGBColorSpace));
      }
      materialParams.metalness = metallicRoughness.metallicFactor !== void 0 ? metallicRoughness.metallicFactor : 1;
      materialParams.roughness = metallicRoughness.roughnessFactor !== void 0 ? metallicRoughness.roughnessFactor : 1;
      if (metallicRoughness.metallicRoughnessTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "metalnessMap", metallicRoughness.metallicRoughnessTexture));
        pending.push(parser.assignTexture(materialParams, "roughnessMap", metallicRoughness.metallicRoughnessTexture));
      }
      materialType = this._invokeOne(function(ext) {
        return ext.getMaterialType && ext.getMaterialType(materialIndex);
      });
      pending.push(Promise.all(this._invokeAll(function(ext) {
        return ext.extendMaterialParams && ext.extendMaterialParams(materialIndex, materialParams);
      })));
    }
    if (materialDef.doubleSided === true) {
      materialParams.side = DoubleSide;
    }
    const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;
    if (alphaMode === ALPHA_MODES.BLEND) {
      materialParams.transparent = true;
      materialParams.depthWrite = false;
    } else {
      materialParams.transparent = false;
      if (alphaMode === ALPHA_MODES.MASK) {
        materialParams.alphaTest = materialDef.alphaCutoff !== void 0 ? materialDef.alphaCutoff : 0.5;
      }
    }
    if (materialDef.normalTexture !== void 0 && materialType !== MeshBasicMaterial) {
      pending.push(parser.assignTexture(materialParams, "normalMap", materialDef.normalTexture));
      materialParams.normalScale = new Vector2(1, 1);
      if (materialDef.normalTexture.scale !== void 0) {
        const scale = materialDef.normalTexture.scale;
        materialParams.normalScale.set(scale, scale);
      }
    }
    if (materialDef.occlusionTexture !== void 0 && materialType !== MeshBasicMaterial) {
      pending.push(parser.assignTexture(materialParams, "aoMap", materialDef.occlusionTexture));
      if (materialDef.occlusionTexture.strength !== void 0) {
        materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;
      }
    }
    if (materialDef.emissiveFactor !== void 0 && materialType !== MeshBasicMaterial) {
      const emissiveFactor = materialDef.emissiveFactor;
      materialParams.emissive = new Color().setRGB(emissiveFactor[0], emissiveFactor[1], emissiveFactor[2], LinearSRGBColorSpace);
    }
    if (materialDef.emissiveTexture !== void 0 && materialType !== MeshBasicMaterial) {
      pending.push(parser.assignTexture(materialParams, "emissiveMap", materialDef.emissiveTexture, SRGBColorSpace));
    }
    return Promise.all(pending).then(function() {
      const material2 = new materialType(materialParams);
      if (materialDef.name) material2.name = materialDef.name;
      assignExtrasToUserData(material2, materialDef);
      parser.associations.set(material2, { materials: materialIndex });
      if (materialDef.extensions) addUnknownExtensionsToUserData(extensions, material2, materialDef);
      return material2;
    });
  }
  /** When Object3D instances are targeted by animation, they need unique names. */
  createUniqueName(originalName) {
    const sanitizedName = PropertyBinding.sanitizeNodeName(originalName || "");
    if (sanitizedName in this.nodeNamesUsed) {
      return sanitizedName + "_" + ++this.nodeNamesUsed[sanitizedName];
    } else {
      this.nodeNamesUsed[sanitizedName] = 0;
      return sanitizedName;
    }
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
   *
   * Creates BufferGeometries from primitives.
   *
   * @param {Array<GLTF.Primitive>} primitives
   * @return {Promise<Array<BufferGeometry>>}
   */
  loadGeometries(primitives) {
    const parser = this;
    const extensions = this.extensions;
    const cache = this.primitiveCache;
    function createDracoPrimitive(primitive) {
      return extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(primitive, parser).then(function(geometry2) {
        return addPrimitiveAttributes(geometry2, primitive, parser);
      });
    }
    const pending = [];
    for (let i = 0, il = primitives.length; i < il; i++) {
      const primitive = primitives[i];
      const cacheKey = createPrimitiveKey(primitive);
      const cached = cache[cacheKey];
      if (cached) {
        pending.push(cached.promise);
      } else {
        let geometryPromise;
        if (primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]) {
          geometryPromise = createDracoPrimitive(primitive);
        } else {
          geometryPromise = addPrimitiveAttributes(new BufferGeometry(), primitive, parser);
        }
        cache[cacheKey] = { primitive, promise: geometryPromise };
        pending.push(geometryPromise);
      }
    }
    return Promise.all(pending);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
   * @param {number} meshIndex
   * @return {Promise<Group|Mesh|SkinnedMesh>}
   */
  loadMesh(meshIndex) {
    const parser = this;
    const json = this.json;
    const extensions = this.extensions;
    const meshDef = json.meshes[meshIndex];
    const primitives = meshDef.primitives;
    const pending = [];
    for (let i = 0, il = primitives.length; i < il; i++) {
      const material2 = primitives[i].material === void 0 ? createDefaultMaterial(this.cache) : this.getDependency("material", primitives[i].material);
      pending.push(material2);
    }
    pending.push(parser.loadGeometries(primitives));
    return Promise.all(pending).then(function(results) {
      const materials = results.slice(0, results.length - 1);
      const geometries = results[results.length - 1];
      const meshes = [];
      for (let i = 0, il = geometries.length; i < il; i++) {
        const geometry2 = geometries[i];
        const primitive = primitives[i];
        let mesh;
        const material2 = materials[i];
        if (primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN || primitive.mode === void 0) {
          mesh = meshDef.isSkinnedMesh === true ? new SkinnedMesh(geometry2, material2) : new Mesh(geometry2, material2);
          if (mesh.isSkinnedMesh === true) {
            mesh.normalizeSkinWeights();
          }
          if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) {
            mesh.geometry = toTrianglesDrawMode(mesh.geometry, TriangleStripDrawMode);
          } else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) {
            mesh.geometry = toTrianglesDrawMode(mesh.geometry, TriangleFanDrawMode);
          }
        } else if (primitive.mode === WEBGL_CONSTANTS.LINES) {
          mesh = new LineSegments(geometry2, material2);
        } else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) {
          mesh = new Line(geometry2, material2);
        } else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) {
          mesh = new LineLoop(geometry2, material2);
        } else if (primitive.mode === WEBGL_CONSTANTS.POINTS) {
          mesh = new Points(geometry2, material2);
        } else {
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + primitive.mode);
        }
        if (Object.keys(mesh.geometry.morphAttributes).length > 0) {
          updateMorphTargets(mesh, meshDef);
        }
        mesh.name = parser.createUniqueName(meshDef.name || "mesh_" + meshIndex);
        assignExtrasToUserData(mesh, meshDef);
        if (primitive.extensions) addUnknownExtensionsToUserData(extensions, mesh, primitive);
        parser.assignFinalMaterial(mesh);
        meshes.push(mesh);
      }
      for (let i = 0, il = meshes.length; i < il; i++) {
        parser.associations.set(meshes[i], {
          meshes: meshIndex,
          primitives: i
        });
      }
      if (meshes.length === 1) {
        if (meshDef.extensions) addUnknownExtensionsToUserData(extensions, meshes[0], meshDef);
        return meshes[0];
      }
      const group = new Group();
      if (meshDef.extensions) addUnknownExtensionsToUserData(extensions, group, meshDef);
      parser.associations.set(group, { meshes: meshIndex });
      for (let i = 0, il = meshes.length; i < il; i++) {
        group.add(meshes[i]);
      }
      return group;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
   * @param {number} cameraIndex
   * @return {Promise<THREE.Camera>}
   */
  loadCamera(cameraIndex) {
    let camera2;
    const cameraDef = this.json.cameras[cameraIndex];
    const params2 = cameraDef[cameraDef.type];
    if (!params2) {
      console.warn("THREE.GLTFLoader: Missing camera parameters.");
      return;
    }
    if (cameraDef.type === "perspective") {
      camera2 = new PerspectiveCamera(MathUtils.radToDeg(params2.yfov), params2.aspectRatio || 1, params2.znear || 1, params2.zfar || 2e6);
    } else if (cameraDef.type === "orthographic") {
      camera2 = new OrthographicCamera(-params2.xmag, params2.xmag, params2.ymag, -params2.ymag, params2.znear, params2.zfar);
    }
    if (cameraDef.name) camera2.name = this.createUniqueName(cameraDef.name);
    assignExtrasToUserData(camera2, cameraDef);
    return Promise.resolve(camera2);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
   * @param {number} skinIndex
   * @return {Promise<Skeleton>}
   */
  loadSkin(skinIndex) {
    const skinDef = this.json.skins[skinIndex];
    const pending = [];
    for (let i = 0, il = skinDef.joints.length; i < il; i++) {
      pending.push(this._loadNodeShallow(skinDef.joints[i]));
    }
    if (skinDef.inverseBindMatrices !== void 0) {
      pending.push(this.getDependency("accessor", skinDef.inverseBindMatrices));
    } else {
      pending.push(null);
    }
    return Promise.all(pending).then(function(results) {
      const inverseBindMatrices = results.pop();
      const jointNodes = results;
      const bones = [];
      const boneInverses = [];
      for (let i = 0, il = jointNodes.length; i < il; i++) {
        const jointNode = jointNodes[i];
        if (jointNode) {
          bones.push(jointNode);
          const mat = new Matrix4();
          if (inverseBindMatrices !== null) {
            mat.fromArray(inverseBindMatrices.array, i * 16);
          }
          boneInverses.push(mat);
        } else {
          console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', skinDef.joints[i]);
        }
      }
      return new Skeleton(bones, boneInverses);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
   * @param {number} animationIndex
   * @return {Promise<AnimationClip>}
   */
  loadAnimation(animationIndex) {
    const json = this.json;
    const parser = this;
    const animationDef = json.animations[animationIndex];
    const animationName = animationDef.name ? animationDef.name : "animation_" + animationIndex;
    const pendingNodes = [];
    const pendingInputAccessors = [];
    const pendingOutputAccessors = [];
    const pendingSamplers = [];
    const pendingTargets = [];
    for (let i = 0, il = animationDef.channels.length; i < il; i++) {
      const channel = animationDef.channels[i];
      const sampler = animationDef.samplers[channel.sampler];
      const target = channel.target;
      const name = target.node;
      const input = animationDef.parameters !== void 0 ? animationDef.parameters[sampler.input] : sampler.input;
      const output = animationDef.parameters !== void 0 ? animationDef.parameters[sampler.output] : sampler.output;
      if (target.node === void 0) continue;
      pendingNodes.push(this.getDependency("node", name));
      pendingInputAccessors.push(this.getDependency("accessor", input));
      pendingOutputAccessors.push(this.getDependency("accessor", output));
      pendingSamplers.push(sampler);
      pendingTargets.push(target);
    }
    return Promise.all([
      Promise.all(pendingNodes),
      Promise.all(pendingInputAccessors),
      Promise.all(pendingOutputAccessors),
      Promise.all(pendingSamplers),
      Promise.all(pendingTargets)
    ]).then(function(dependencies) {
      const nodes = dependencies[0];
      const inputAccessors = dependencies[1];
      const outputAccessors = dependencies[2];
      const samplers = dependencies[3];
      const targets = dependencies[4];
      const tracks = [];
      for (let i = 0, il = nodes.length; i < il; i++) {
        const node = nodes[i];
        const inputAccessor = inputAccessors[i];
        const outputAccessor = outputAccessors[i];
        const sampler = samplers[i];
        const target = targets[i];
        if (node === void 0) continue;
        if (node.updateMatrix) {
          node.updateMatrix();
        }
        const createdTracks = parser._createAnimationTracks(node, inputAccessor, outputAccessor, sampler, target);
        if (createdTracks) {
          for (let k = 0; k < createdTracks.length; k++) {
            tracks.push(createdTracks[k]);
          }
        }
      }
      return new AnimationClip(animationName, void 0, tracks);
    });
  }
  createNodeMesh(nodeIndex) {
    const json = this.json;
    const parser = this;
    const nodeDef = json.nodes[nodeIndex];
    if (nodeDef.mesh === void 0) return null;
    return parser.getDependency("mesh", nodeDef.mesh).then(function(mesh) {
      const node = parser._getNodeRef(parser.meshCache, nodeDef.mesh, mesh);
      if (nodeDef.weights !== void 0) {
        node.traverse(function(o) {
          if (!o.isMesh) return;
          for (let i = 0, il = nodeDef.weights.length; i < il; i++) {
            o.morphTargetInfluences[i] = nodeDef.weights[i];
          }
        });
      }
      return node;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
   * @param {number} nodeIndex
   * @return {Promise<Object3D>}
   */
  loadNode(nodeIndex) {
    const json = this.json;
    const parser = this;
    const nodeDef = json.nodes[nodeIndex];
    const nodePending = parser._loadNodeShallow(nodeIndex);
    const childPending = [];
    const childrenDef = nodeDef.children || [];
    for (let i = 0, il = childrenDef.length; i < il; i++) {
      childPending.push(parser.getDependency("node", childrenDef[i]));
    }
    const skeletonPending = nodeDef.skin === void 0 ? Promise.resolve(null) : parser.getDependency("skin", nodeDef.skin);
    return Promise.all([
      nodePending,
      Promise.all(childPending),
      skeletonPending
    ]).then(function(results) {
      const node = results[0];
      const children = results[1];
      const skeleton = results[2];
      if (skeleton !== null) {
        node.traverse(function(mesh) {
          if (!mesh.isSkinnedMesh) return;
          mesh.bind(skeleton, _identityMatrix);
        });
      }
      for (let i = 0, il = children.length; i < il; i++) {
        node.add(children[i]);
      }
      return node;
    });
  }
  // ._loadNodeShallow() parses a single node.
  // skin and child nodes are created and added in .loadNode() (no '_' prefix).
  _loadNodeShallow(nodeIndex) {
    const json = this.json;
    const extensions = this.extensions;
    const parser = this;
    if (this.nodeCache[nodeIndex] !== void 0) {
      return this.nodeCache[nodeIndex];
    }
    const nodeDef = json.nodes[nodeIndex];
    const nodeName = nodeDef.name ? parser.createUniqueName(nodeDef.name) : "";
    const pending = [];
    const meshPromise = parser._invokeOne(function(ext) {
      return ext.createNodeMesh && ext.createNodeMesh(nodeIndex);
    });
    if (meshPromise) {
      pending.push(meshPromise);
    }
    if (nodeDef.camera !== void 0) {
      pending.push(parser.getDependency("camera", nodeDef.camera).then(function(camera2) {
        return parser._getNodeRef(parser.cameraCache, nodeDef.camera, camera2);
      }));
    }
    parser._invokeAll(function(ext) {
      return ext.createNodeAttachment && ext.createNodeAttachment(nodeIndex);
    }).forEach(function(promise) {
      pending.push(promise);
    });
    this.nodeCache[nodeIndex] = Promise.all(pending).then(function(objects) {
      let node;
      if (nodeDef.isBone === true) {
        node = new Bone();
      } else if (objects.length > 1) {
        node = new Group();
      } else if (objects.length === 1) {
        node = objects[0];
      } else {
        node = new Object3D();
      }
      if (node !== objects[0]) {
        for (let i = 0, il = objects.length; i < il; i++) {
          node.add(objects[i]);
        }
      }
      if (nodeDef.name) {
        node.userData.name = nodeDef.name;
        node.name = nodeName;
      }
      assignExtrasToUserData(node, nodeDef);
      if (nodeDef.extensions) addUnknownExtensionsToUserData(extensions, node, nodeDef);
      if (nodeDef.matrix !== void 0) {
        const matrix = new Matrix4();
        matrix.fromArray(nodeDef.matrix);
        node.applyMatrix4(matrix);
      } else {
        if (nodeDef.translation !== void 0) {
          node.position.fromArray(nodeDef.translation);
        }
        if (nodeDef.rotation !== void 0) {
          node.quaternion.fromArray(nodeDef.rotation);
        }
        if (nodeDef.scale !== void 0) {
          node.scale.fromArray(nodeDef.scale);
        }
      }
      if (!parser.associations.has(node)) {
        parser.associations.set(node, {});
      }
      parser.associations.get(node).nodes = nodeIndex;
      return node;
    });
    return this.nodeCache[nodeIndex];
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
   * @param {number} sceneIndex
   * @return {Promise<Group>}
   */
  loadScene(sceneIndex) {
    const extensions = this.extensions;
    const sceneDef = this.json.scenes[sceneIndex];
    const parser = this;
    const scene2 = new Group();
    if (sceneDef.name) scene2.name = parser.createUniqueName(sceneDef.name);
    assignExtrasToUserData(scene2, sceneDef);
    if (sceneDef.extensions) addUnknownExtensionsToUserData(extensions, scene2, sceneDef);
    const nodeIds = sceneDef.nodes || [];
    const pending = [];
    for (let i = 0, il = nodeIds.length; i < il; i++) {
      pending.push(parser.getDependency("node", nodeIds[i]));
    }
    return Promise.all(pending).then(function(nodes) {
      for (let i = 0, il = nodes.length; i < il; i++) {
        scene2.add(nodes[i]);
      }
      const reduceAssociations = (node) => {
        const reducedAssociations = /* @__PURE__ */ new Map();
        for (const [key, value] of parser.associations) {
          if (key instanceof Material || key instanceof Texture) {
            reducedAssociations.set(key, value);
          }
        }
        node.traverse((node2) => {
          const mappings = parser.associations.get(node2);
          if (mappings != null) {
            reducedAssociations.set(node2, mappings);
          }
        });
        return reducedAssociations;
      };
      parser.associations = reduceAssociations(scene2);
      return scene2;
    });
  }
  _createAnimationTracks(node, inputAccessor, outputAccessor, sampler, target) {
    const tracks = [];
    const targetName = node.name ? node.name : node.uuid;
    const targetNames = [];
    if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {
      node.traverse(function(object) {
        if (object.morphTargetInfluences) {
          targetNames.push(object.name ? object.name : object.uuid);
        }
      });
    } else {
      targetNames.push(targetName);
    }
    let TypedKeyframeTrack;
    switch (PATH_PROPERTIES[target.path]) {
      case PATH_PROPERTIES.weights:
        TypedKeyframeTrack = NumberKeyframeTrack;
        break;
      case PATH_PROPERTIES.rotation:
        TypedKeyframeTrack = QuaternionKeyframeTrack;
        break;
      case PATH_PROPERTIES.position:
      case PATH_PROPERTIES.scale:
        TypedKeyframeTrack = VectorKeyframeTrack;
        break;
      default:
        switch (outputAccessor.itemSize) {
          case 1:
            TypedKeyframeTrack = NumberKeyframeTrack;
            break;
          case 2:
          case 3:
          default:
            TypedKeyframeTrack = VectorKeyframeTrack;
            break;
        }
        break;
    }
    const interpolation = sampler.interpolation !== void 0 ? INTERPOLATION[sampler.interpolation] : InterpolateLinear;
    const outputArray = this._getArrayFromAccessor(outputAccessor);
    for (let j = 0, jl = targetNames.length; j < jl; j++) {
      const track = new TypedKeyframeTrack(
        targetNames[j] + "." + PATH_PROPERTIES[target.path],
        inputAccessor.array,
        outputArray,
        interpolation
      );
      if (sampler.interpolation === "CUBICSPLINE") {
        this._createCubicSplineTrackInterpolant(track);
      }
      tracks.push(track);
    }
    return tracks;
  }
  _getArrayFromAccessor(accessor) {
    let outputArray = accessor.array;
    if (accessor.normalized) {
      const scale = getNormalizedComponentScale(outputArray.constructor);
      const scaled = new Float32Array(outputArray.length);
      for (let j = 0, jl = outputArray.length; j < jl; j++) {
        scaled[j] = outputArray[j] * scale;
      }
      outputArray = scaled;
    }
    return outputArray;
  }
  _createCubicSplineTrackInterpolant(track) {
    track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline(result) {
      const interpolantType = this instanceof QuaternionKeyframeTrack ? GLTFCubicSplineQuaternionInterpolant : GLTFCubicSplineInterpolant;
      return new interpolantType(this.times, this.values, this.getValueSize() / 3, result);
    };
    track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;
  }
}
function computeBounds(geometry2, primitiveDef, parser) {
  const attributes = primitiveDef.attributes;
  const box2 = new Box3();
  if (attributes.POSITION !== void 0) {
    const accessor = parser.json.accessors[attributes.POSITION];
    const min = accessor.min;
    const max = accessor.max;
    if (min !== void 0 && max !== void 0) {
      box2.set(
        new Vector3(min[0], min[1], min[2]),
        new Vector3(max[0], max[1], max[2])
      );
      if (accessor.normalized) {
        const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType]);
        box2.min.multiplyScalar(boxScale);
        box2.max.multiplyScalar(boxScale);
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return;
    }
  } else {
    return;
  }
  const targets = primitiveDef.targets;
  if (targets !== void 0) {
    const maxDisplacement = new Vector3();
    const vector = new Vector3();
    for (let i = 0, il = targets.length; i < il; i++) {
      const target = targets[i];
      if (target.POSITION !== void 0) {
        const accessor = parser.json.accessors[target.POSITION];
        const min = accessor.min;
        const max = accessor.max;
        if (min !== void 0 && max !== void 0) {
          vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])));
          vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])));
          vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])));
          if (accessor.normalized) {
            const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType]);
            vector.multiplyScalar(boxScale);
          }
          maxDisplacement.max(vector);
        } else {
          console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
        }
      }
    }
    box2.expandByVector(maxDisplacement);
  }
  geometry2.boundingBox = box2;
  const sphere = new Sphere();
  box2.getCenter(sphere.center);
  sphere.radius = box2.min.distanceTo(box2.max) / 2;
  geometry2.boundingSphere = sphere;
}
function addPrimitiveAttributes(geometry2, primitiveDef, parser) {
  const attributes = primitiveDef.attributes;
  const pending = [];
  function assignAttributeAccessor(accessorIndex, attributeName) {
    return parser.getDependency("accessor", accessorIndex).then(function(accessor) {
      geometry2.setAttribute(attributeName, accessor);
    });
  }
  for (const gltfAttributeName in attributes) {
    const threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();
    if (threeAttributeName in geometry2.attributes) continue;
    pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName));
  }
  if (primitiveDef.indices !== void 0 && !geometry2.index) {
    const accessor = parser.getDependency("accessor", primitiveDef.indices).then(function(accessor2) {
      geometry2.setIndex(accessor2);
    });
    pending.push(accessor);
  }
  if (ColorManagement.workingColorSpace !== LinearSRGBColorSpace && "COLOR_0" in attributes) {
    console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ColorManagement.workingColorSpace}" not supported.`);
  }
  assignExtrasToUserData(geometry2, primitiveDef);
  computeBounds(geometry2, primitiveDef, parser);
  return Promise.all(pending).then(function() {
    return primitiveDef.targets !== void 0 ? addMorphTargets(geometry2, primitiveDef.targets, parser) : geometry2;
  });
}
class FontLoader extends Loader {
  constructor(manager) {
    super(manager);
  }
  load(url, onLoad, onProgress, onError) {
    const scope = this;
    const loader2 = new FileLoader(this.manager);
    loader2.setPath(this.path);
    loader2.setRequestHeader(this.requestHeader);
    loader2.setWithCredentials(this.withCredentials);
    loader2.load(url, function(text) {
      const font = scope.parse(JSON.parse(text));
      if (onLoad) onLoad(font);
    }, onProgress, onError);
  }
  parse(json) {
    return new Font(json);
  }
}
class Font {
  constructor(data) {
    this.isFont = true;
    this.type = "Font";
    this.data = data;
  }
  generateShapes(text, size = 100) {
    const shapes = [];
    const paths = createPaths(text, size, this.data);
    for (let p = 0, pl = paths.length; p < pl; p++) {
      shapes.push(...paths[p].toShapes());
    }
    return shapes;
  }
}
function createPaths(text, size, data) {
  const chars = Array.from(text);
  const scale = size / data.resolution;
  const line_height = (data.boundingBox.yMax - data.boundingBox.yMin + data.underlineThickness) * scale;
  const paths = [];
  let offsetX = 0, offsetY = 0;
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (char === "\n") {
      offsetX = 0;
      offsetY -= line_height;
    } else {
      const ret = createPath(char, scale, offsetX, offsetY, data);
      offsetX += ret.offsetX;
      paths.push(ret.path);
    }
  }
  return paths;
}
function createPath(char, scale, offsetX, offsetY, data) {
  const glyph = data.glyphs[char] || data.glyphs["?"];
  if (!glyph) {
    console.error('THREE.Font: character "' + char + '" does not exists in font family ' + data.familyName + ".");
    return;
  }
  const path = new ShapePath();
  let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2;
  if (glyph.o) {
    const outline = glyph._cachedOutline || (glyph._cachedOutline = glyph.o.split(" "));
    for (let i = 0, l = outline.length; i < l; ) {
      const action = outline[i++];
      switch (action) {
        case "m":
          x = outline[i++] * scale + offsetX;
          y = outline[i++] * scale + offsetY;
          path.moveTo(x, y);
          break;
        case "l":
          x = outline[i++] * scale + offsetX;
          y = outline[i++] * scale + offsetY;
          path.lineTo(x, y);
          break;
        case "q":
          cpx = outline[i++] * scale + offsetX;
          cpy = outline[i++] * scale + offsetY;
          cpx1 = outline[i++] * scale + offsetX;
          cpy1 = outline[i++] * scale + offsetY;
          path.quadraticCurveTo(cpx1, cpy1, cpx, cpy);
          break;
        case "b":
          cpx = outline[i++] * scale + offsetX;
          cpy = outline[i++] * scale + offsetY;
          cpx1 = outline[i++] * scale + offsetX;
          cpy1 = outline[i++] * scale + offsetY;
          cpx2 = outline[i++] * scale + offsetX;
          cpy2 = outline[i++] * scale + offsetY;
          path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cpx, cpy);
          break;
      }
    }
  }
  return { offsetX: glyph.ha * scale, path };
}
class TextGeometry extends ExtrudeGeometry {
  constructor(text, parameters = {}) {
    const font = parameters.font;
    if (font === void 0) {
      super();
    } else {
      const shapes = font.generateShapes(text, parameters.size);
      if (parameters.depth === void 0 && parameters.height !== void 0) {
        console.warn("THREE.TextGeometry: .height is now depreciated. Please use .depth instead");
      }
      parameters.depth = parameters.depth !== void 0 ? parameters.depth : parameters.height !== void 0 ? parameters.height : 50;
      if (parameters.bevelThickness === void 0) parameters.bevelThickness = 10;
      if (parameters.bevelSize === void 0) parameters.bevelSize = 8;
      if (parameters.bevelEnabled === void 0) parameters.bevelEnabled = false;
      super(shapes, parameters);
    }
    this.type = "TextGeometry";
  }
}
const tubeRadiusRange = {
  min: 0.01,
  max: 0.15,
  speed: 0.5
  // Controls oscillation speed
};
const colorRange = {
  speed: 0.01
  // Controls color change speed
};
const bloomStrengthRange = {
  min: 1.1,
  max: 2.5,
  speed: 0.3
  // Controls oscillation speed
};
const cameraZoomRange = {
  min: 12,
  max: 30,
  speed: -0.2
  // Controls oscillation speed
};
const mouseHueInfluence = {
  value: 0,
  strength: 0.15
  // How much mouse position affects the hue
};
const mouseCameraInfluence = {
  value: 0,
  strength: 7
  // How many units the mouse can move the camera
};
const initialHue = Date.now() % 1e3 / 1e3;
const initialColor = new THREE.Color();
initialColor.setHSL(initialHue, 1, 0.5);
const params = {
  a: 1,
  // random btwn 10
  b: 1,
  // random btwn 10,
  c: 1,
  delta: Math.PI / 2,
  A: 16,
  B: 17,
  C: 10,
  tubeRadius: 0.2,
  radialSegments: 8,
  // color: 0xff0000,
  color: 15107681,
  // color: initialColor.getHex(), // Convert HSL color to hex
  pixelSize: 1,
  // Pixel size for shader
  bloomStrength: 1.5,
  bloomRadius: 0.4,
  bloomThreshold: 0,
  exposure: 1,
  backgroundColor: 0,
  grainAmount: 0.75,
  grainSpeed: 0.2,
  animateValues: false,
  // New parameter for animation toggle
  cameraDistance: 15
  // Initial camera distance
};
var modelRef = null;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1e3
);
camera.position.z = params.cameraDistance;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = params.exposure;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0";
document.body.appendChild(renderer.domElement);
const svgMarkup = `<svg width="100%" height="100%" viewBox="0 0 349 121" xmlns="http://www.w3.org/2000/svg">

<clipPath id="svgTextPath">
<path d="M166.492 0.152327H130.998L128.251 0.840872C125.656 1.55462 123.273 2.88884 121.306 4.7283C119.338 6.56777 117.845 8.85767 116.953 11.4026C111.305 26.7094 105.58 41.4807 99.9318 56.5579C92.2987 77.5283 84.6655 98.4218 76.4218 119.392V120.387H103.901C104.194 120.432 104.493 120.362 104.735 120.191C104.977 120.02 105.143 119.76 105.199 119.469L128.098 58.2415C128.158 57.9564 128.278 57.6874 128.449 57.452C128.62 57.2166 128.839 57.0201 129.092 56.8756C129.344 56.731 129.624 56.6424 129.913 56.614C130.202 56.5856 130.494 56.6185 130.769 56.7111C131.032 56.8184 131.269 56.9786 131.467 57.182C131.665 57.3854 131.819 57.6272 131.919 57.893C132.019 58.1587 132.064 58.4425 132.05 58.7263C132.036 59.0101 131.964 59.2883 131.838 59.5429C129.93 64.6707 128.021 69.7219 126.19 74.8497C122.602 84.3399 119.091 93.83 115.579 103.397C115.554 103.702 115.554 104.01 115.579 104.315L120.236 103.856L156.187 100.106C156.975 99.9435 157.796 100.091 158.478 100.518C159.16 100.946 159.652 101.62 159.851 102.402C161.988 108.295 164.126 114.189 166.187 120.158C166.187 120.847 166.721 121 167.408 121H179.239V17.8322C179.315 14.6554 178.717 11.4982 177.484 8.57089C176.706 6.22359 175.242 4.16509 173.281 2.6636C171.321 1.16212 168.956 0.28735 166.492 0.152327Z" fill="#ffffff"></path>
<path d="M262.058 65.054C261.59 63.6282 260.76 62.3496 259.649 61.3431C258.538 60.3367 257.185 59.6371 255.723 59.3139C253.847 58.9336 251.897 59.2328 250.22 60.1576C248.543 61.0824 247.248 62.5733 246.563 64.3654C246.029 65.6665 245.571 66.9678 245.037 68.3454C244.502 69.723 243.434 70.4115 242.289 69.9523C241.144 69.4931 240.686 68.3449 241.22 66.8907L257.479 23.1901C258.371 20.9895 258.787 18.6234 258.699 16.2495C258.61 13.8755 258.02 11.5478 256.966 9.42009C255.912 7.2924 254.419 5.41422 252.586 3.90892C250.753 2.40362 248.622 1.30535 246.334 0.688545C245.342 0.688545 244.35 0.229602 243.281 0H197.483L194.048 0.688545C190.533 1.61174 187.428 3.68911 185.229 6.58836C183.029 9.48761 181.861 13.0423 181.911 16.6848V120.159H206.337C206.61 120.204 206.889 120.141 207.117 119.984C207.345 119.827 207.503 119.588 207.558 119.316C215.14 98.9073 222.773 78.4982 230.457 58.0891V57.4772C230.542 57.2224 230.678 56.9876 230.857 56.7868C231.035 56.586 231.252 56.4238 231.494 56.3094C231.737 56.1949 232 56.1303 232.268 56.1207C232.536 56.111 232.803 56.1558 233.053 56.2524C233.309 56.3447 233.545 56.4891 233.743 56.6765C233.942 56.864 234.1 57.0904 234.207 57.3417C234.315 57.5931 234.369 57.8642 234.367 58.1377C234.366 58.4112 234.308 58.6818 234.198 58.9318L228.931 72.9372C225.42 82.4275 221.909 91.8408 218.474 101.254C218.308 101.57 218.179 101.904 218.092 102.249L223.282 101.714L239.159 100.031L248.548 98.959C249.489 98.7277 250.483 98.8793 251.313 99.3813C252.143 99.8833 252.74 100.695 252.975 101.638L259.387 119.699C259.387 120.235 259.387 120.465 260.379 120.465H285.11L284.652 119.47L262.058 65.054Z" fill="#ffffff"></path>
<path d="M89.5509 55.7931H70.239C69.9384 55.769 69.6396 55.857 69.4 56.0407C69.1604 56.2244 68.9971 56.4908 68.9415 56.7881L53.0646 100.03C52.454 101.714 51.4617 102.326 50.2404 101.867C49.0191 101.408 48.7139 100.412 49.4009 98.652L64.667 57.4766C65.1846 55.8782 66.2123 54.495 67.5919 53.5406C68.9714 52.5862 70.6261 52.1141 72.3001 52.1962H78.8644C79.7563 52.3003 80.6561 52.0789 81.3989 51.5731C82.1416 51.0672 82.678 50.3098 82.9102 49.4402C86.1924 40.7153 89.4744 31.9144 92.6803 23.1895C93.5893 20.692 93.8927 18.0137 93.5655 15.3754C93.2382 12.7371 92.29 10.2145 90.7986 8.01627C89.3072 5.81806 87.3153 4.0072 84.9881 2.73306C82.6608 1.45891 80.0648 0.757535 77.4141 0.687977C65.3539 0.687977 53.2173 0.687977 41.157 0.687977C37.7379 0.650561 34.391 1.6757 31.5756 3.62154C28.7603 5.56737 26.6145 8.33886 25.4329 11.5562C17.291 32.8326 9.17447 54.1344 1.08341 75.4619C-0.361137 79.0987 -0.361137 83.1521 1.08341 86.7888L9.55601 109.749C10.6775 113.054 12.8231 115.913 15.6791 117.91C18.5352 119.906 21.9525 120.935 25.4329 120.847H70.4683C70.7704 120.894 71.079 120.826 71.3334 120.656C71.5878 120.486 71.7693 120.226 71.8421 119.929C79.0172 100.566 86.1925 81.6611 93.4439 61.9153C94.101 61.3364 94.5298 60.5414 94.6528 59.673C94.7759 58.8047 94.585 57.921 94.1148 57.1814C93.6445 56.4418 92.9261 55.8954 92.0891 55.6408C91.252 55.3862 90.3517 55.4401 89.5509 55.7931Z" fill="#ffffff"></path>
<path d="M323.81 94.2139C321.825 94.2139 320.909 92.9126 321.596 91.0758L339.076 44.0071C341.824 36.3537 344.648 29.3891 347.167 21.9653C347.885 19.7757 348.143 17.461 347.924 15.1667C347.705 12.8724 347.014 10.6487 345.895 8.63531C344.776 6.62194 343.254 4.86286 341.423 3.46889C339.593 2.07491 337.494 1.0765 335.26 0.536262L332.588 0H331.672C331.061 1.91335 330.374 3.75002 329.687 5.58684C322.054 26.4041 314.421 47.1451 306.788 67.9623C306.821 68.1136 306.821 68.2707 306.788 68.422C306.733 68.7063 306.618 68.9748 306.449 69.2096C306.28 69.4443 306.061 69.6398 305.809 69.7813C305.558 69.9229 305.278 70.0069 304.99 70.0289C304.702 70.0509 304.413 70.01 304.143 69.9084C303.872 69.8067 303.627 69.6467 303.425 69.4403C303.222 69.2339 303.067 68.9862 302.97 68.7135C302.873 68.4407 302.837 68.1497 302.863 67.8614C302.89 67.5731 302.979 67.2942 303.124 67.044C304.956 61.9162 306.941 56.7884 308.849 51.7371C315.108 34.7976 321.393 17.9091 327.703 1.07159V0.0766089H279.92C276.889 0.40804 274.015 1.59953 271.635 3.51093C269.256 5.42233 267.469 7.97462 266.485 10.8682C264.806 15.2306 263.203 19.6695 261.524 24.1084C260.302 27.3994 258.852 30.7664 257.86 34.1339C256.756 38.3156 257.133 42.7521 258.929 46.6856C262.974 56.6351 267.172 66.508 271.294 76.3809L287.476 115.108C288.092 116.623 289.151 117.917 290.513 118.818C291.875 119.72 293.478 120.187 295.109 120.159H348.541V93.9841H347.549L323.81 94.2139Z" fill="#ffffff"></path>
</clipPath>
</svg>`;
const loader = new SVGLoader();
const svgData = loader.parse(svgMarkup);
const svgGroup = new THREE.Group();
svgData.paths.forEach((path) => {
  const shapes = path.toShapes(true);
  shapes.forEach((shape) => {
    const geometry2 = new THREE.ShapeGeometry(shape);
    const material2 = new THREE.MeshPhysicalMaterial({
      color: path.color,
      metalness: 0,
      roughness: 0.8,
      transmission: 0.9,
      thickness: 1,
      // Added back thickness
      ior: 1.5,
      // Index of refraction (glass = 1.5)
      transparent: true,
      opacity: 0.7,
      envMapIntensity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.75
    });
    const mesh = new THREE.Mesh(geometry2, material2);
    svgGroup.add(mesh);
  });
});
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new THREE.Scene()).texture;
const box = new THREE.Box3().setFromObject(svgGroup);
const center = box.getCenter(new THREE.Vector3());
svgGroup.position.sub(center);
svgGroup.scale.set(0.05, -0.05, 0.05);
svgGroup.position.set(-9, 3, 0);
const ambientLight = new THREE.AmbientLight(4210752, 1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(16777215, 25);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);
const controls = new OrbitControls(camera, renderer.domElement);
scene.background = new THREE.Color(params.backgroundColor);
const points = [];
for (let t = 0; t <= 2 * Math.PI; t += 0.01) {
  const x = params.A * Math.sin(params.a * t + params.delta);
  const y = params.B * Math.sin(params.b * t);
  const z = params.C * Math.sin(params.c * t);
  points.push(new THREE.Vector3(x, y, z));
}
const curve = new THREE.CatmullRomCurve3(points);
const geometry = new THREE.TubeGeometry(
  curve,
  400,
  params.tubeRadius,
  params.radialSegments,
  false
);
const material = new THREE.MeshPhongMaterial({
  color: params.color,
  side: THREE.DoubleSide
});
const tubeMesh = new THREE.Mesh(geometry, material);
scene.add(tubeMesh);
function updateLissajousCurve() {
  const points2 = [];
  for (let t = 0; t <= 2 * Math.PI; t += 0.01) {
    const x = params.A * Math.sin(params.a * t + params.delta);
    const y = params.B * Math.sin(params.b * t);
    const z = params.C * Math.sin(params.c * t);
    points2.push(new THREE.Vector3(x, y, z));
  }
  const curve2 = new THREE.CatmullRomCurve3(points2);
  tubeMesh.geometry.dispose();
  tubeMesh.geometry = new THREE.TubeGeometry(
    curve2,
    400,
    params.tubeRadius,
    params.radialSegments,
    false
  );
  material.color.setHex(params.color);
}
const PixelationShader = {
  uniforms: {
    tDiffuse: { value: null },
    // The rendered scene
    resolution: { value: new THREE.Vector2() },
    // Screen resolution
    pixelSize: { value: params.pixelSize }
    // Pixel size for effect
  },
  vertexShader: `
							varying vec2 vUv;
							void main() {
									vUv = uv;
									gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
							}
					`,
  fragmentShader: `
							uniform sampler2D tDiffuse;
							uniform vec2 resolution;
							uniform float pixelSize;

							varying vec2 vUv;

							void main() {
									vec2 dxy = pixelSize / resolution;
									vec2 coord = dxy * floor(vUv / dxy);
									gl_FragColor = texture2D(tDiffuse, coord);
							}
					`
};
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const pixelPass = new ShaderPass(PixelationShader);
pixelPass.uniforms["resolution"].value.set(
  window.innerWidth,
  window.innerHeight
);
composer.addPass(pixelPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  params.bloomStrength,
  params.bloomRadius,
  params.bloomThreshold
);
const GrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.08 },
    speed: { value: 1 },
    time: { value: 0 }
  },
  vertexShader: `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
  fragmentShader: `
uniform sampler2D tDiffuse;
uniform float amount;
uniform float speed;
uniform float time;
varying vec2 vUv;

float random(vec2 co) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
	vec4 color = texture2D(tDiffuse, vUv);
	vec2 uvRandom = vUv;
	uvRandom.y *= random(vec2(uvRandom.y, time * speed));
	color.rgb += amount * (random(uvRandom) - 0.5);
	gl_FragColor = color;
}
`
};
const grainPass = new ShaderPass(GrainShader);
composer.addPass(grainPass);
grainPass.uniforms.amount.value = params.grainAmount;
grainPass.uniforms.speed.value = params.grainSpeed;
let gui;
gui = new GUI();
const guiElement = gui.domElement;
guiElement.style.zIndex = "9999";
guiElement.style.position = "fixed";
guiElement.style.top = "50px";
guiElement.style.right = "0px";
gui.add(params, "a", 1, 10, 1).onChange(updateLissajousCurve);
gui.add(params, "b", 1, 10, 1).onChange(updateLissajousCurve);
gui.add(params, "c", 1, 10, 1).onChange(updateLissajousCurve);
gui.add(params, "A", 1, 20).onChange(updateLissajousCurve);
gui.add(params, "B", 1, 20).onChange(updateLissajousCurve);
gui.add(params, "C", 1, 20).onChange(updateLissajousCurve);
const tubeRadiusController = gui.add(params, "tubeRadius", 0.01, 0.8).step(5e-3).onChange(updateLissajousCurve);
gui.add(params, "radialSegments", 3, 20, 1).onChange(updateLissajousCurve);
gui.addColor(params, "color").onChange(updateLissajousCurve);
gui.add(params, "pixelSize", 1, 50).onChange(function(value) {
  pixelPass.uniforms["pixelSize"].value = value;
}).name("Pixel Size");
gui.add(params, "bloomStrength", 0, 3).onChange(function(value) {
  bloomPass.strength = value;
}).name("Bloom Strength");
gui.add(params, "bloomRadius", 0, 1).onChange(function(value) {
  bloomPass.radius = value;
}).name("Bloom Radius");
gui.add(params, "bloomThreshold", 0, 1).onChange(function(value) {
  bloomPass.threshold = value;
}).name("Bloom Threshold");
gui.add(params, "exposure", 0.1, 2).onChange(function(value) {
  renderer.toneMappingExposure = value;
}).name("Exposure");
gui.addColor(params, "backgroundColor").onChange(function(value) {
  scene.background.set(value);
}).name("BG Color");
gui.add(params, "grainAmount", 0, 2.5).onChange(function(value) {
  grainPass.uniforms.amount.value = value;
}).name("Grain Amount");
gui.add(params, "grainSpeed", 0, 5).onChange(function(value) {
  grainPass.uniforms.speed.value = value;
}).name("Grain Speed");
gui.add(params, "cameraDistance", 5, 50).onChange((value) => {
  camera.position.z = value;
}).name("Camera Zoom");
gui.add(params, "animateValues").name("Animate Values?");
function updateTubeRadiusGUI() {
  tubeRadiusController.setValue(params.tubeRadius);
}
function updateColorGUI() {
  if (gui) {
    const colorController = Object.values(gui.__controllers).find(
      (controller) => controller.property === "color"
    );
    if (colorController) {
      colorController.updateDisplay();
    }
  }
}
function updateBloomStrengthGUI() {
  if (gui) {
    const bloomController = Object.values(gui.__controllers).find(
      (controller) => controller.property === "bloomStrength"
    );
    if (bloomController) {
      bloomController.updateDisplay();
    }
  }
}
function updateCameraZoomGUI() {
  if (gui) {
    const zoomController = Object.values(gui.__controllers).find(
      (controller) => controller.property === "cameraDistance"
    );
    if (zoomController) {
      zoomController.updateDisplay();
    }
  }
}
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  pixelPass.uniforms["resolution"].value.set(
    window.innerWidth,
    window.innerHeight
  );
  bloomPass.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
if (!window.location.search.includes("dev")) {
  guiElement.style.display = "none";
  controls.enabled = false;
  controls.enableZoom = false;
  controls.enableRotate = false;
  controls.enablePan = false;
}
window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");
}, false);
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.01;
  grainPass.uniforms.time.value = time;
  if (modelRef) {
    modelRef.rotation.y += 8e-3;
  }
  if (params.animateValues) {
    params.tubeRadius = tubeRadiusRange.min + (Math.sin(time * tubeRadiusRange.speed) + 1) * 0.5 * (tubeRadiusRange.max - tubeRadiusRange.min);
    updateTubeRadiusGUI();
    const hue = (initialHue + time * colorRange.speed + mouseHueInfluence.value) % 1;
    const color = new THREE.Color();
    color.setHSL(hue, 1, 0.5);
    params.color = color.getHex();
    updateColorGUI();
    params.bloomStrength = bloomStrengthRange.min + (Math.sin(time * bloomStrengthRange.speed) + 1) * 0.5 * (bloomStrengthRange.max - bloomStrengthRange.min);
    bloomPass.strength = params.bloomStrength;
    updateBloomStrengthGUI();
    const oscillation = (Math.sin((time + 4) * cameraZoomRange.speed) + 1) * 0.5;
    const baseDistance = cameraZoomRange.min + oscillation * (cameraZoomRange.max - cameraZoomRange.min);
    params.cameraDistance = baseDistance + mouseCameraInfluence.value;
    camera.position.z = params.cameraDistance;
    updateCameraZoomGUI();
  }
  updateLissajousCurve();
  tubeMesh.rotation.x += 5e-3;
  tubeMesh.rotation.y += 0.01;
  composer.render();
}
animate();
function updateFromPointer(x, y) {
  mouseHueInfluence.value = (x / window.innerWidth * 2 - 1) * mouseHueInfluence.strength;
  mouseCameraInfluence.value = (y / window.innerHeight * 2 - 1) * mouseCameraInfluence.strength;
}
window.addEventListener("mousemove", (event) => {
  updateFromPointer(event.clientX, event.clientY);
});
window.addEventListener("touchmove", (event) => {
  if (event.touches.length > 0) {
    updateFromPointer(event.touches[0].clientX, event.touches[0].clientY);
  }
});
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "./public/assets/weathered_old_pylon.glb",
  (gltf) => {
    const model = gltf.scene;
    let mScale = 50;
    model.scale.set(mScale, mScale, mScale);
    model.position.set(0, -7, 0);
    modelRef = model;
    console.log("modelRef", modelRef);
    window.modelRef = modelRef;
    scene.add(model);
    model.traverse((child) => {
      if (child.isMesh) ;
    });
    console.log("GLB model loaded successfully");
  },
  (progress) => {
    console.log("Loading progress: ", progress.loaded / progress.total * 100, "%");
  },
  (error) => {
    console.error("Error loading GLB model:", error);
  }
);
const fontLoader = new FontLoader();
fontLoader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", (font) => {
  const textGroup = new THREE.Group();
  scene.add(textGroup);
  const text = `WATCH OUT                 `;
  const textMaterial = new THREE.MeshStandardMaterial({
    color: 16777215,
    metalness: 0.9,
    // Full metalness for chrome effect
    roughness: 0.2,
    // Low roughness for high shine
    envMapIntensity: 1.5
    // Enhance environment reflections
  });
  const radius = 4;
  const height = 5;
  for (let i = 0; i < text.length; i++) {
    const letter = text[i];
    const textGeometry = new TextGeometry(letter, {
      font,
      size: 0.8,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.2,
      bevelOffset: 0,
      bevelSegments: 5
    });
    const letterMesh = new THREE.Mesh(textGeometry, textMaterial);
    const angle = i / text.length * Math.PI * 2;
    letterMesh.position.x = Math.sin(angle) * radius;
    letterMesh.position.z = Math.cos(angle) * radius;
    letterMesh.position.y = height;
    letterMesh.rotation.y = -Math.PI / 2 + angle + Math.PI / 2;
    textGroup.add(letterMesh);
  }
  const animateText = () => {
    textGroup.rotation.y -= 0.02;
    requestAnimationFrame(animateText);
  };
  animateText();
});
if (!scene.environment) {
  const pmremGenerator2 = new THREE.PMREMGenerator(renderer);
  pmremGenerator2.compileEquirectangularShader();
  const cubeRenderTarget = pmremGenerator2.fromScene(new THREE.Scene());
  scene.environment = cubeRenderTarget.texture;
}
const chromeLight = new THREE.DirectionalLight(16777215, 2);
chromeLight.position.set(5, 10, 7);
scene.add(chromeLight);
