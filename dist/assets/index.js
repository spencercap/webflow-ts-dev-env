import * as THREE from "three";
import { Ray, Plane, MathUtils, Vector3, Controls, MOUSE, TOUCH, Quaternion, Spherical, Vector2, OrthographicCamera, Mesh, BufferGeometry, Float32BufferAttribute, ShaderMaterial, UniformsUtils, WebGLRenderTarget, HalfFloatType, NoBlending, Clock, Color, AdditiveBlending, MeshBasicMaterial, RawShaderMaterial, ColorManagement, SRGBTransfer, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, AgXToneMapping, NeutralToneMapping } from "three";
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
var Easing = Object.freeze({
  Linear: Object.freeze({
    None: function(amount) {
      return amount;
    },
    In: function(amount) {
      return amount;
    },
    Out: function(amount) {
      return amount;
    },
    InOut: function(amount) {
      return amount;
    }
  }),
  Quadratic: Object.freeze({
    In: function(amount) {
      return amount * amount;
    },
    Out: function(amount) {
      return amount * (2 - amount);
    },
    InOut: function(amount) {
      if ((amount *= 2) < 1) {
        return 0.5 * amount * amount;
      }
      return -0.5 * (--amount * (amount - 2) - 1);
    }
  }),
  Cubic: Object.freeze({
    In: function(amount) {
      return amount * amount * amount;
    },
    Out: function(amount) {
      return --amount * amount * amount + 1;
    },
    InOut: function(amount) {
      if ((amount *= 2) < 1) {
        return 0.5 * amount * amount * amount;
      }
      return 0.5 * ((amount -= 2) * amount * amount + 2);
    }
  }),
  Quartic: Object.freeze({
    In: function(amount) {
      return amount * amount * amount * amount;
    },
    Out: function(amount) {
      return 1 - --amount * amount * amount * amount;
    },
    InOut: function(amount) {
      if ((amount *= 2) < 1) {
        return 0.5 * amount * amount * amount * amount;
      }
      return -0.5 * ((amount -= 2) * amount * amount * amount - 2);
    }
  }),
  Quintic: Object.freeze({
    In: function(amount) {
      return amount * amount * amount * amount * amount;
    },
    Out: function(amount) {
      return --amount * amount * amount * amount * amount + 1;
    },
    InOut: function(amount) {
      if ((amount *= 2) < 1) {
        return 0.5 * amount * amount * amount * amount * amount;
      }
      return 0.5 * ((amount -= 2) * amount * amount * amount * amount + 2);
    }
  }),
  Sinusoidal: Object.freeze({
    In: function(amount) {
      return 1 - Math.sin((1 - amount) * Math.PI / 2);
    },
    Out: function(amount) {
      return Math.sin(amount * Math.PI / 2);
    },
    InOut: function(amount) {
      return 0.5 * (1 - Math.sin(Math.PI * (0.5 - amount)));
    }
  }),
  Exponential: Object.freeze({
    In: function(amount) {
      return amount === 0 ? 0 : Math.pow(1024, amount - 1);
    },
    Out: function(amount) {
      return amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount);
    },
    InOut: function(amount) {
      if (amount === 0) {
        return 0;
      }
      if (amount === 1) {
        return 1;
      }
      if ((amount *= 2) < 1) {
        return 0.5 * Math.pow(1024, amount - 1);
      }
      return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
    }
  }),
  Circular: Object.freeze({
    In: function(amount) {
      return 1 - Math.sqrt(1 - amount * amount);
    },
    Out: function(amount) {
      return Math.sqrt(1 - --amount * amount);
    },
    InOut: function(amount) {
      if ((amount *= 2) < 1) {
        return -0.5 * (Math.sqrt(1 - amount * amount) - 1);
      }
      return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
    }
  }),
  Elastic: Object.freeze({
    In: function(amount) {
      if (amount === 0) {
        return 0;
      }
      if (amount === 1) {
        return 1;
      }
      return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
    },
    Out: function(amount) {
      if (amount === 0) {
        return 0;
      }
      if (amount === 1) {
        return 1;
      }
      return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1;
    },
    InOut: function(amount) {
      if (amount === 0) {
        return 0;
      }
      if (amount === 1) {
        return 1;
      }
      amount *= 2;
      if (amount < 1) {
        return -0.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
      }
      return 0.5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1;
    }
  }),
  Back: Object.freeze({
    In: function(amount) {
      var s = 1.70158;
      return amount === 1 ? 1 : amount * amount * ((s + 1) * amount - s);
    },
    Out: function(amount) {
      var s = 1.70158;
      return amount === 0 ? 0 : --amount * amount * ((s + 1) * amount + s) + 1;
    },
    InOut: function(amount) {
      var s = 1.70158 * 1.525;
      if ((amount *= 2) < 1) {
        return 0.5 * (amount * amount * ((s + 1) * amount - s));
      }
      return 0.5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2);
    }
  }),
  Bounce: Object.freeze({
    In: function(amount) {
      return 1 - Easing.Bounce.Out(1 - amount);
    },
    Out: function(amount) {
      if (amount < 1 / 2.75) {
        return 7.5625 * amount * amount;
      } else if (amount < 2 / 2.75) {
        return 7.5625 * (amount -= 1.5 / 2.75) * amount + 0.75;
      } else if (amount < 2.5 / 2.75) {
        return 7.5625 * (amount -= 2.25 / 2.75) * amount + 0.9375;
      } else {
        return 7.5625 * (amount -= 2.625 / 2.75) * amount + 0.984375;
      }
    },
    InOut: function(amount) {
      if (amount < 0.5) {
        return Easing.Bounce.In(amount * 2) * 0.5;
      }
      return Easing.Bounce.Out(amount * 2 - 1) * 0.5 + 0.5;
    }
  }),
  generatePow: function(power) {
    if (power === void 0) {
      power = 4;
    }
    power = power < Number.EPSILON ? Number.EPSILON : power;
    power = power > 1e4 ? 1e4 : power;
    return {
      In: function(amount) {
        return Math.pow(amount, power);
      },
      Out: function(amount) {
        return 1 - Math.pow(1 - amount, power);
      },
      InOut: function(amount) {
        if (amount < 0.5) {
          return Math.pow(amount * 2, power) / 2;
        }
        return (1 - Math.pow(2 - amount * 2, power)) / 2 + 0.5;
      }
    };
  }
});
var now = function() {
  return performance.now();
};
var Group = (
  /** @class */
  function() {
    function Group2() {
      var tweens = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        tweens[_i] = arguments[_i];
      }
      this._tweens = {};
      this._tweensAddedDuringUpdate = {};
      this.add.apply(this, tweens);
    }
    Group2.prototype.getAll = function() {
      var _this = this;
      return Object.keys(this._tweens).map(function(tweenId) {
        return _this._tweens[tweenId];
      });
    };
    Group2.prototype.removeAll = function() {
      this._tweens = {};
    };
    Group2.prototype.add = function() {
      var _a;
      var tweens = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        tweens[_i] = arguments[_i];
      }
      for (var _b = 0, tweens_1 = tweens; _b < tweens_1.length; _b++) {
        var tween = tweens_1[_b];
        (_a = tween._group) === null || _a === void 0 ? void 0 : _a.remove(tween);
        tween._group = this;
        this._tweens[tween.getId()] = tween;
        this._tweensAddedDuringUpdate[tween.getId()] = tween;
      }
    };
    Group2.prototype.remove = function() {
      var tweens = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        tweens[_i] = arguments[_i];
      }
      for (var _a = 0, tweens_2 = tweens; _a < tweens_2.length; _a++) {
        var tween = tweens_2[_a];
        tween._group = void 0;
        delete this._tweens[tween.getId()];
        delete this._tweensAddedDuringUpdate[tween.getId()];
      }
    };
    Group2.prototype.allStopped = function() {
      return this.getAll().every(function(tween) {
        return !tween.isPlaying();
      });
    };
    Group2.prototype.update = function(time, preserve) {
      if (time === void 0) {
        time = now();
      }
      if (preserve === void 0) {
        preserve = true;
      }
      var tweenIds = Object.keys(this._tweens);
      if (tweenIds.length === 0)
        return;
      while (tweenIds.length > 0) {
        this._tweensAddedDuringUpdate = {};
        for (var i = 0; i < tweenIds.length; i++) {
          var tween = this._tweens[tweenIds[i]];
          var autoStart = !preserve;
          if (tween && tween.update(time, autoStart) === false && !preserve)
            this.remove(tween);
        }
        tweenIds = Object.keys(this._tweensAddedDuringUpdate);
      }
    };
    return Group2;
  }()
);
var Interpolation = {
  Linear: function(v, k) {
    var m = v.length - 1;
    var f = m * k;
    var i = Math.floor(f);
    var fn = Interpolation.Utils.Linear;
    if (k < 0) {
      return fn(v[0], v[1], f);
    }
    if (k > 1) {
      return fn(v[m], v[m - 1], m - f);
    }
    return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
  },
  Bezier: function(v, k) {
    var b = 0;
    var n = v.length - 1;
    var pw = Math.pow;
    var bn = Interpolation.Utils.Bernstein;
    for (var i = 0; i <= n; i++) {
      b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
    }
    return b;
  },
  CatmullRom: function(v, k) {
    var m = v.length - 1;
    var f = m * k;
    var i = Math.floor(f);
    var fn = Interpolation.Utils.CatmullRom;
    if (v[0] === v[m]) {
      if (k < 0) {
        i = Math.floor(f = m * (1 + k));
      }
      return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
    } else {
      if (k < 0) {
        return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
      }
      if (k > 1) {
        return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
      }
      return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
    }
  },
  Utils: {
    Linear: function(p0, p1, t) {
      return (p1 - p0) * t + p0;
    },
    Bernstein: function(n, i) {
      var fc = Interpolation.Utils.Factorial;
      return fc(n) / fc(i) / fc(n - i);
    },
    Factorial: /* @__PURE__ */ function() {
      var a = [1];
      return function(n) {
        var s = 1;
        if (a[n]) {
          return a[n];
        }
        for (var i = n; i > 1; i--) {
          s *= i;
        }
        a[n] = s;
        return s;
      };
    }(),
    CatmullRom: function(p0, p1, p2, p3, t) {
      var v0 = (p2 - p0) * 0.5;
      var v1 = (p3 - p1) * 0.5;
      var t2 = t * t;
      var t3 = t * t2;
      return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
    }
  }
};
var Sequence = (
  /** @class */
  function() {
    function Sequence2() {
    }
    Sequence2.nextId = function() {
      return Sequence2._nextId++;
    };
    Sequence2._nextId = 0;
    return Sequence2;
  }()
);
var mainGroup = new Group();
var Tween = (
  /** @class */
  function() {
    function Tween2(object, group) {
      this._isPaused = false;
      this._pauseStart = 0;
      this._valuesStart = {};
      this._valuesEnd = {};
      this._valuesStartRepeat = {};
      this._duration = 1e3;
      this._isDynamic = false;
      this._initialRepeat = 0;
      this._repeat = 0;
      this._yoyo = false;
      this._isPlaying = false;
      this._reversed = false;
      this._delayTime = 0;
      this._startTime = 0;
      this._easingFunction = Easing.Linear.None;
      this._interpolationFunction = Interpolation.Linear;
      this._chainedTweens = [];
      this._onStartCallbackFired = false;
      this._onEveryStartCallbackFired = false;
      this._id = Sequence.nextId();
      this._isChainStopped = false;
      this._propertiesAreSetUp = false;
      this._goToEnd = false;
      this._object = object;
      if (typeof group === "object") {
        this._group = group;
        group.add(this);
      } else if (group === true) {
        this._group = mainGroup;
        mainGroup.add(this);
      }
    }
    Tween2.prototype.getId = function() {
      return this._id;
    };
    Tween2.prototype.isPlaying = function() {
      return this._isPlaying;
    };
    Tween2.prototype.isPaused = function() {
      return this._isPaused;
    };
    Tween2.prototype.getDuration = function() {
      return this._duration;
    };
    Tween2.prototype.to = function(target, duration) {
      if (duration === void 0) {
        duration = 1e3;
      }
      if (this._isPlaying)
        throw new Error("Can not call Tween.to() while Tween is already started or paused. Stop the Tween first.");
      this._valuesEnd = target;
      this._propertiesAreSetUp = false;
      this._duration = duration < 0 ? 0 : duration;
      return this;
    };
    Tween2.prototype.duration = function(duration) {
      if (duration === void 0) {
        duration = 1e3;
      }
      this._duration = duration < 0 ? 0 : duration;
      return this;
    };
    Tween2.prototype.dynamic = function(dynamic) {
      if (dynamic === void 0) {
        dynamic = false;
      }
      this._isDynamic = dynamic;
      return this;
    };
    Tween2.prototype.start = function(time, overrideStartingValues) {
      if (time === void 0) {
        time = now();
      }
      if (overrideStartingValues === void 0) {
        overrideStartingValues = false;
      }
      if (this._isPlaying) {
        return this;
      }
      this._repeat = this._initialRepeat;
      if (this._reversed) {
        this._reversed = false;
        for (var property in this._valuesStartRepeat) {
          this._swapEndStartRepeatValues(property);
          this._valuesStart[property] = this._valuesStartRepeat[property];
        }
      }
      this._isPlaying = true;
      this._isPaused = false;
      this._onStartCallbackFired = false;
      this._onEveryStartCallbackFired = false;
      this._isChainStopped = false;
      this._startTime = time;
      this._startTime += this._delayTime;
      if (!this._propertiesAreSetUp || overrideStartingValues) {
        this._propertiesAreSetUp = true;
        if (!this._isDynamic) {
          var tmp = {};
          for (var prop in this._valuesEnd)
            tmp[prop] = this._valuesEnd[prop];
          this._valuesEnd = tmp;
        }
        this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat, overrideStartingValues);
      }
      return this;
    };
    Tween2.prototype.startFromCurrentValues = function(time) {
      return this.start(time, true);
    };
    Tween2.prototype._setupProperties = function(_object, _valuesStart, _valuesEnd, _valuesStartRepeat, overrideStartingValues) {
      for (var property in _valuesEnd) {
        var startValue = _object[property];
        var startValueIsArray = Array.isArray(startValue);
        var propType = startValueIsArray ? "array" : typeof startValue;
        var isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property]);
        if (propType === "undefined" || propType === "function") {
          continue;
        }
        if (isInterpolationList) {
          var endValues = _valuesEnd[property];
          if (endValues.length === 0) {
            continue;
          }
          var temp = [startValue];
          for (var i = 0, l = endValues.length; i < l; i += 1) {
            var value = this._handleRelativeValue(startValue, endValues[i]);
            if (isNaN(value)) {
              isInterpolationList = false;
              console.warn("Found invalid interpolation list. Skipping.");
              break;
            }
            temp.push(value);
          }
          if (isInterpolationList) {
            _valuesEnd[property] = temp;
          }
        }
        if ((propType === "object" || startValueIsArray) && startValue && !isInterpolationList) {
          _valuesStart[property] = startValueIsArray ? [] : {};
          var nestedObject = startValue;
          for (var prop in nestedObject) {
            _valuesStart[property][prop] = nestedObject[prop];
          }
          _valuesStartRepeat[property] = startValueIsArray ? [] : {};
          var endValues = _valuesEnd[property];
          if (!this._isDynamic) {
            var tmp = {};
            for (var prop in endValues)
              tmp[prop] = endValues[prop];
            _valuesEnd[property] = endValues = tmp;
          }
          this._setupProperties(nestedObject, _valuesStart[property], endValues, _valuesStartRepeat[property], overrideStartingValues);
        } else {
          if (typeof _valuesStart[property] === "undefined" || overrideStartingValues) {
            _valuesStart[property] = startValue;
          }
          if (!startValueIsArray) {
            _valuesStart[property] *= 1;
          }
          if (isInterpolationList) {
            _valuesStartRepeat[property] = _valuesEnd[property].slice().reverse();
          } else {
            _valuesStartRepeat[property] = _valuesStart[property] || 0;
          }
        }
      }
    };
    Tween2.prototype.stop = function() {
      if (!this._isChainStopped) {
        this._isChainStopped = true;
        this.stopChainedTweens();
      }
      if (!this._isPlaying) {
        return this;
      }
      this._isPlaying = false;
      this._isPaused = false;
      if (this._onStopCallback) {
        this._onStopCallback(this._object);
      }
      return this;
    };
    Tween2.prototype.end = function() {
      this._goToEnd = true;
      this.update(this._startTime + this._duration);
      return this;
    };
    Tween2.prototype.pause = function(time) {
      if (time === void 0) {
        time = now();
      }
      if (this._isPaused || !this._isPlaying) {
        return this;
      }
      this._isPaused = true;
      this._pauseStart = time;
      return this;
    };
    Tween2.prototype.resume = function(time) {
      if (time === void 0) {
        time = now();
      }
      if (!this._isPaused || !this._isPlaying) {
        return this;
      }
      this._isPaused = false;
      this._startTime += time - this._pauseStart;
      this._pauseStart = 0;
      return this;
    };
    Tween2.prototype.stopChainedTweens = function() {
      for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
        this._chainedTweens[i].stop();
      }
      return this;
    };
    Tween2.prototype.group = function(group) {
      if (!group) {
        console.warn("tween.group() without args has been removed, use group.add(tween) instead.");
        return this;
      }
      group.add(this);
      return this;
    };
    Tween2.prototype.remove = function() {
      var _a;
      (_a = this._group) === null || _a === void 0 ? void 0 : _a.remove(this);
      return this;
    };
    Tween2.prototype.delay = function(amount) {
      if (amount === void 0) {
        amount = 0;
      }
      this._delayTime = amount;
      return this;
    };
    Tween2.prototype.repeat = function(times) {
      if (times === void 0) {
        times = 0;
      }
      this._initialRepeat = times;
      this._repeat = times;
      return this;
    };
    Tween2.prototype.repeatDelay = function(amount) {
      this._repeatDelayTime = amount;
      return this;
    };
    Tween2.prototype.yoyo = function(yoyo) {
      if (yoyo === void 0) {
        yoyo = false;
      }
      this._yoyo = yoyo;
      return this;
    };
    Tween2.prototype.easing = function(easingFunction) {
      if (easingFunction === void 0) {
        easingFunction = Easing.Linear.None;
      }
      this._easingFunction = easingFunction;
      return this;
    };
    Tween2.prototype.interpolation = function(interpolationFunction) {
      if (interpolationFunction === void 0) {
        interpolationFunction = Interpolation.Linear;
      }
      this._interpolationFunction = interpolationFunction;
      return this;
    };
    Tween2.prototype.chain = function() {
      var tweens = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        tweens[_i] = arguments[_i];
      }
      this._chainedTweens = tweens;
      return this;
    };
    Tween2.prototype.onStart = function(callback) {
      this._onStartCallback = callback;
      return this;
    };
    Tween2.prototype.onEveryStart = function(callback) {
      this._onEveryStartCallback = callback;
      return this;
    };
    Tween2.prototype.onUpdate = function(callback) {
      this._onUpdateCallback = callback;
      return this;
    };
    Tween2.prototype.onRepeat = function(callback) {
      this._onRepeatCallback = callback;
      return this;
    };
    Tween2.prototype.onComplete = function(callback) {
      this._onCompleteCallback = callback;
      return this;
    };
    Tween2.prototype.onStop = function(callback) {
      this._onStopCallback = callback;
      return this;
    };
    Tween2.prototype.update = function(time, autoStart) {
      var _this = this;
      var _a;
      if (time === void 0) {
        time = now();
      }
      if (autoStart === void 0) {
        autoStart = Tween2.autoStartOnUpdate;
      }
      if (this._isPaused)
        return true;
      var property;
      if (!this._goToEnd && !this._isPlaying) {
        if (autoStart)
          this.start(time, true);
        else
          return false;
      }
      this._goToEnd = false;
      if (time < this._startTime) {
        return true;
      }
      if (this._onStartCallbackFired === false) {
        if (this._onStartCallback) {
          this._onStartCallback(this._object);
        }
        this._onStartCallbackFired = true;
      }
      if (this._onEveryStartCallbackFired === false) {
        if (this._onEveryStartCallback) {
          this._onEveryStartCallback(this._object);
        }
        this._onEveryStartCallbackFired = true;
      }
      var elapsedTime = time - this._startTime;
      var durationAndDelay = this._duration + ((_a = this._repeatDelayTime) !== null && _a !== void 0 ? _a : this._delayTime);
      var totalTime = this._duration + this._repeat * durationAndDelay;
      var calculateElapsedPortion = function() {
        if (_this._duration === 0)
          return 1;
        if (elapsedTime > totalTime) {
          return 1;
        }
        var timesRepeated = Math.trunc(elapsedTime / durationAndDelay);
        var timeIntoCurrentRepeat = elapsedTime - timesRepeated * durationAndDelay;
        var portion = Math.min(timeIntoCurrentRepeat / _this._duration, 1);
        if (portion === 0 && elapsedTime === _this._duration) {
          return 1;
        }
        return portion;
      };
      var elapsed = calculateElapsedPortion();
      var value = this._easingFunction(elapsed);
      this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);
      if (this._onUpdateCallback) {
        this._onUpdateCallback(this._object, elapsed);
      }
      if (this._duration === 0 || elapsedTime >= this._duration) {
        if (this._repeat > 0) {
          var completeCount = Math.min(Math.trunc((elapsedTime - this._duration) / durationAndDelay) + 1, this._repeat);
          if (isFinite(this._repeat)) {
            this._repeat -= completeCount;
          }
          for (property in this._valuesStartRepeat) {
            if (!this._yoyo && typeof this._valuesEnd[property] === "string") {
              this._valuesStartRepeat[property] = // eslint-disable-next-line
              // @ts-ignore FIXME?
              this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
            }
            if (this._yoyo) {
              this._swapEndStartRepeatValues(property);
            }
            this._valuesStart[property] = this._valuesStartRepeat[property];
          }
          if (this._yoyo) {
            this._reversed = !this._reversed;
          }
          this._startTime += durationAndDelay * completeCount;
          if (this._onRepeatCallback) {
            this._onRepeatCallback(this._object);
          }
          this._onEveryStartCallbackFired = false;
          return true;
        } else {
          if (this._onCompleteCallback) {
            this._onCompleteCallback(this._object);
          }
          for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
            this._chainedTweens[i].start(this._startTime + this._duration, false);
          }
          this._isPlaying = false;
          return false;
        }
      }
      return true;
    };
    Tween2.prototype._updateProperties = function(_object, _valuesStart, _valuesEnd, value) {
      for (var property in _valuesEnd) {
        if (_valuesStart[property] === void 0) {
          continue;
        }
        var start = _valuesStart[property] || 0;
        var end = _valuesEnd[property];
        var startIsArray = Array.isArray(_object[property]);
        var endIsArray = Array.isArray(end);
        var isInterpolationList = !startIsArray && endIsArray;
        if (isInterpolationList) {
          _object[property] = this._interpolationFunction(end, value);
        } else if (typeof end === "object" && end) {
          this._updateProperties(_object[property], start, end, value);
        } else {
          end = this._handleRelativeValue(start, end);
          if (typeof end === "number") {
            _object[property] = start + (end - start) * value;
          }
        }
      }
    };
    Tween2.prototype._handleRelativeValue = function(start, end) {
      if (typeof end !== "string") {
        return end;
      }
      if (end.charAt(0) === "+" || end.charAt(0) === "-") {
        return start + parseFloat(end);
      }
      return parseFloat(end);
    };
    Tween2.prototype._swapEndStartRepeatValues = function(property) {
      var tmp = this._valuesStartRepeat[property];
      var endValue = this._valuesEnd[property];
      if (typeof endValue === "string") {
        this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(endValue);
      } else {
        this._valuesStartRepeat[property] = this._valuesEnd[property];
      }
      this._valuesEnd[property] = tmp;
    };
    Tween2.autoStartOnUpdate = false;
    return Tween2;
  }()
);
var TWEEN = mainGroup;
TWEEN.getAll.bind(TWEEN);
TWEEN.removeAll.bind(TWEEN);
TWEEN.add.bind(TWEEN);
TWEEN.remove.bind(TWEEN);
TWEEN.update.bind(TWEEN);
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
  constructor(material) {
    this._mesh = new Mesh(_geometry, material);
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
const OutputShader = {
  name: "OutputShader",
  uniforms: {
    "tDiffuse": { value: null },
    "toneMappingExposure": { value: 1 }
  },
  vertexShader: (
    /* glsl */
    `
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`
  ),
  fragmentShader: (
    /* glsl */
    `
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`
  )
};
class OutputPass extends Pass {
  constructor() {
    super();
    const shader = OutputShader;
    this.uniforms = UniformsUtils.clone(shader.uniforms);
    this.material = new RawShaderMaterial({
      name: shader.name,
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    });
    this.fsQuad = new FullScreenQuad(this.material);
    this._outputColorSpace = null;
    this._toneMapping = null;
  }
  render(renderer2, writeBuffer, readBuffer) {
    this.uniforms["tDiffuse"].value = readBuffer.texture;
    this.uniforms["toneMappingExposure"].value = renderer2.toneMappingExposure;
    if (this._outputColorSpace !== renderer2.outputColorSpace || this._toneMapping !== renderer2.toneMapping) {
      this._outputColorSpace = renderer2.outputColorSpace;
      this._toneMapping = renderer2.toneMapping;
      this.material.defines = {};
      if (ColorManagement.getTransfer(this._outputColorSpace) === SRGBTransfer) this.material.defines.SRGB_TRANSFER = "";
      if (this._toneMapping === LinearToneMapping) this.material.defines.LINEAR_TONE_MAPPING = "";
      else if (this._toneMapping === ReinhardToneMapping) this.material.defines.REINHARD_TONE_MAPPING = "";
      else if (this._toneMapping === CineonToneMapping) this.material.defines.CINEON_TONE_MAPPING = "";
      else if (this._toneMapping === ACESFilmicToneMapping) this.material.defines.ACES_FILMIC_TONE_MAPPING = "";
      else if (this._toneMapping === AgXToneMapping) this.material.defines.AGX_TONE_MAPPING = "";
      else if (this._toneMapping === NeutralToneMapping) this.material.defines.NEUTRAL_TONE_MAPPING = "";
      this.material.needsUpdate = true;
    }
    if (this.renderToScreen === true) {
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
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2e3
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(2236962);
document.body.appendChild(renderer.domElement);
const CUBE_COUNT = 256;
const SPIRAL_ORBITS = 13;
const SPIRAL_EXPANSION_RATIO = 10;
function getSpiralPosition(index) {
  const angle = index / CUBE_COUNT * Math.PI * 2 * SPIRAL_ORBITS;
  const baseRadius = 12;
  const height = index * 1.75;
  const radiusMultiplier = 1 + height / (CUBE_COUNT * 0.5) * SPIRAL_EXPANSION_RATIO;
  const radius = baseRadius * radiusMultiplier;
  return {
    x: Math.cos(angle) * radius,
    y: height - CUBE_COUNT * 0.25,
    z: Math.sin(angle) * radius
  };
}
const cubeGroup = new THREE.Group();
scene.add(cubeGroup);
for (let i = 0; i < CUBE_COUNT; i++) {
  const cubeSize = 2.4;
  const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const material = new THREE.MeshPhongMaterial({
    color: 1698883,
    // Halfway between 0x00FF00 and 0x31D886
    emissive: new THREE.Color(1698883).multiplyScalar(0.2),
    shininess: 100
  });
  const cube = new THREE.Mesh(geometry, material);
  const pos = getSpiralPosition(i);
  cube.position.set(pos.x, pos.y, pos.z);
  const normalizedHeight = (pos.y + CUBE_COUNT * 0.25) / (CUBE_COUNT * 1.75);
  const scaleMultiplier = 1 + normalizedHeight * 2.5;
  cube.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
  cubeGroup.add(cube);
}
const ambientLight = new THREE.AmbientLight(4210752, 1.6);
scene.add(ambientLight);
const mainLight = new THREE.DirectionalLight(16777215, 1.2);
mainLight.position.set(10, 10, 10);
scene.add(mainLight);
const accentLight = new THREE.DirectionalLight(8042751, 0.8);
accentLight.position.set(-15, 5, -15);
scene.add(accentLight);
const rimLight = new THREE.DirectionalLight(16777215, 0.4);
rimLight.position.set(0, -10, 0);
scene.add(rimLight);
camera.position.set(15, -50, 140);
camera.lookAt(0, 0, 0);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
const tweenGroup = new Group();
function createRandomRotation(cube, currentIndex) {
  const nextIndex = (currentIndex + 1) % CUBE_COUNT;
  if (currentIndex % 2 === 0) {
    const axes = ["x", "y", "z"];
    const randomAxis = axes[Math.floor(Math.random() * axes.length)];
    const targetRotation = cube.rotation[randomAxis] + Math.PI / 2;
    const baseColor = new THREE.Color(1698883);
    const activeColor = new THREE.Color(1698883).multiplyScalar(2);
    const material = cube.material;
    material.emissive.copy(baseColor).multiplyScalar(0.2);
    new Tween(material.color, tweenGroup).to(activeColor, 200).easing(Easing.Quadratic.Out).onUpdate(() => {
      material.emissive.copy(material.color).multiplyScalar(0.3);
    }).chain(
      new Tween(material.color, tweenGroup).to(baseColor, 600).easing(Easing.Quadratic.InOut).onUpdate(() => {
        material.emissive.copy(material.color).multiplyScalar(0.2);
      })
    ).start();
    const currentY = cube.position.y;
    const normalizedHeight = (currentY + CUBE_COUNT * 0.25) / (CUBE_COUNT * 1.75);
    const baseJumpHeight = 0.75 + Math.random() * 0.5;
    const heightMultiplier = 1 + normalizedHeight * 2;
    const jumpHeight = baseJumpHeight * heightMultiplier;
    const jumpDuration = 400 + Math.random() * 200;
    new Tween(cube.position, tweenGroup).to({ y: currentY + jumpHeight }, jumpDuration).easing(Easing.Quadratic.Out).chain(
      new Tween(cube.position, tweenGroup).to({ y: currentY }, jumpDuration).easing(Easing.Quadratic.In)
    ).start();
    new Tween(cube.rotation, tweenGroup).to({ [randomAxis]: targetRotation }, jumpDuration * 0.8).easing(Easing.Quadratic.InOut).start();
  }
  const nextDelay = 1e3 + Math.random() * 200;
  setTimeout(() => createRandomRotation(cube, nextIndex), nextDelay);
}
cubeGroup.children.forEach((cube, index) => createRandomRotation(cube, index));
const cubeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e3);
let activeCamera = camera;
window.addEventListener("keydown", (event) => {
  if (event.key === "c" || event.key === "C") {
    console.log("switching camera");
    if (activeCamera === camera) {
      activeCamera = cubeCamera;
    } else if (activeCamera === cubeCamera) {
      activeCamera = spiralCamera;
    } else if (activeCamera === spiralCamera) {
      activeCamera = orbitingCamera;
    } else if (activeCamera === orbitingCamera) {
      activeCamera = topCamera;
    } else if (activeCamera === topCamera) {
      activeCamera = cube20Camera;
    } else if (activeCamera === cube20Camera) {
      activeCamera = cube20Camera2;
    } else {
      activeCamera = camera;
    }
  }
});
const bloomParams = {
  threshold: 0.5,
  strength: 0.5,
  // 5
  radius: 0.02,
  exposure: 0.4
};
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  bloomParams.strength,
  bloomParams.radius,
  bloomParams.threshold
);
const outputPass = new OutputPass();
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = bloomParams.exposure;
renderer.setClearColor(1710618);
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  cubeCamera.aspect = width / height;
  cubeCamera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
});
const targetCube = cubeGroup.children[13];
const spiralCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e3);
const targetCubeForSpiral = cubeGroup.children[30];
const orbitingCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e3);
let orbitAngle = 0;
const topCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1e3);
topCamera.position.set(0, 300, 0);
topCamera.lookAt(0, 0, 0);
activeCamera = topCamera;
const cube20Camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1e3);
const targetCube20 = cubeGroup.children[40];
const cube20Camera2 = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1e3);
const targetCube20_2 = cubeGroup.children[50];
const cameraMap = {
  "main": camera,
  "cube": cubeCamera,
  "spiral": spiralCamera,
  "orbiting": orbitingCamera,
  "top": topCamera,
  "cube20": cube20Camera,
  "cube20_2": cube20Camera2
};
function updateCameraQueryString(cameraName) {
  const url = new URL(window.location.href);
  url.searchParams.set("camera", cameraName);
  window.history.replaceState({}, "", url.toString());
}
function getInitialCamera() {
  const params = new URLSearchParams(window.location.search);
  const cameraParam = params.get("camera");
  return cameraParam && cameraMap[cameraParam] ? cameraMap[cameraParam] : camera;
}
activeCamera = getInitialCamera();
window.addEventListener("keydown", (event) => {
  if (event.key === "c" || event.key === "C") {
    console.log("switching camera");
    if (activeCamera === camera) {
      activeCamera = cubeCamera;
      updateCameraQueryString("cube");
    } else if (activeCamera === cubeCamera) {
      activeCamera = spiralCamera;
      updateCameraQueryString("spiral");
    } else if (activeCamera === spiralCamera) {
      activeCamera = orbitingCamera;
      updateCameraQueryString("orbiting");
    } else if (activeCamera === orbitingCamera) {
      activeCamera = topCamera;
      updateCameraQueryString("top");
    } else if (activeCamera === topCamera) {
      activeCamera = cube20Camera;
      updateCameraQueryString("cube20");
    } else if (activeCamera === cube20Camera) {
      activeCamera = cube20Camera2;
      updateCameraQueryString("cube20_2");
    } else {
      activeCamera = camera;
      updateCameraQueryString("main");
    }
  }
});
function animate() {
  requestAnimationFrame(animate);
  cubeGroup.rotation.y -= 15e-4;
  const offset = new THREE.Vector3(0, 0, 2);
  offset.applyQuaternion(targetCube.quaternion);
  cubeCamera.position.copy(targetCube.position).add(offset);
  cubeCamera.lookAt(targetCube.position);
  const spiralOffset = new THREE.Vector3(0, 0, 15);
  spiralOffset.applyMatrix4(targetCubeForSpiral.matrixWorld);
  spiralCamera.position.copy(spiralOffset);
  spiralCamera.lookAt(targetCubeForSpiral.position);
  orbitAngle += 5e-3;
  const orbitRadius = 200;
  const orbitHeight = Math.sin(orbitAngle * 0.5) * 100;
  orbitingCamera.position.x = Math.cos(orbitAngle) * orbitRadius;
  orbitingCamera.position.z = Math.sin(orbitAngle) * orbitRadius;
  orbitingCamera.position.y = orbitHeight;
  orbitingCamera.lookAt(0, 0, 0);
  cube20Camera.position.copy(targetCube20.position);
  cube20Camera.lookAt(0, 0, 0);
  const directionToCenter = targetCube20_2.position.clone().negate().normalize();
  const offsetDistance = 20;
  cube20Camera2.position.copy(targetCube20_2.position).add(directionToCenter.multiplyScalar(-offsetDistance));
  cube20Camera2.lookAt(0, -8, 0);
  renderScene.camera = activeCamera;
  tweenGroup.update();
  controls.update();
  composer.render();
}
animate();
