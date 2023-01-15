"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CharacterControls = void 0;
var THREE = require("three");
var utils_1 = require("./utils");
var CharacterControls = /** @class */ (function() {
    function CharacterControls(
        model,
        mixer,
        animationsMap,
        orbitControl,
        camera,
        currentAction
    ) {
        this.animationsMap = new Map(); // Walk, Run, Idle

        // state
        this.toggleRun = true;

        // temporary data
        this.walkDirection = new THREE.Vector3();
        this.rotateAngle = new THREE.Vector3(0, 1, 0);
        this.rotateQuarternion = new THREE.Quaternion();
        this.cameraTarget = new THREE.Vector3();

        // constants
        this.fadeDuration = 0.2;
        this.runVelocity = 5;
        this.walkVelocity = 2;
        this.model = model;
        this.mixer = mixer;
        this.animationsMap = animationsMap;
        this.currentAction = currentAction;
        this.animationsMap.forEach(function(value, key) {
            if (key == currentAction) {
                value.play();
            }
        });
        this.orbitControl = orbitControl;
        this.camera = camera;
        this.updateCameraTarget(0, 0);
    }
    CharacterControls.prototype.switchRunToggle = function() {
        this.toggleRun = !this.toggleRun;
    };
    CharacterControls.prototype.update = function(delta, keysPressed) {
        var directionPressed = utils_1.DIRECTIONS.some(function(key) {
            return keysPressed[key] == true;
        });
        var play = "";
        if (directionPressed && this.toggleRun) {
            play = "Run";
        }
        else if (directionPressed) {
            play = "Walk";
        }
        else {
            play = "Idle";
        }
        if (this.currentAction != play) {
            var toPlay = this.animationsMap.get(play);
            var current = this.animationsMap.get(this.currentAction);
            current.fadeOut(this.fadeDuration);
            toPlay.reset().fadeIn(this.fadeDuration).play();
            this.currentAction = play;
        }
        this.mixer.update(delta);
        if (this.currentAction == "Run" || this.currentAction == "Walk") {
            // calculate towards camera direction
            var angleYCameraDirection = Math.atan2(
                this.camera.position.x - this.model.position.x,
                this.camera.position.z - this.model.position.z
            );
            // diagonal movement angle offset
            var directionOffset = this.directionOffset(keysPressed);
            // rotate model
            this.rotateQuarternion.setFromAxisAngle(
                this.rotateAngle,
                angleYCameraDirection + directionOffset
            );
            this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2);
            // calculate direction
            this.camera.getWorldDirection(this.walkDirection);
            this.walkDirection.y = 0;
            this.walkDirection.normalize();
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);
            // run/walk velocity
            var velocity =
                this.currentAction == "Run" ? this.runVelocity : this.walkVelocity;
            // move model & camera
            var moveX = this.walkDirection.x * velocity * delta;
            var moveZ = this.walkDirection.z * velocity * delta;
            this.model.position.x += moveX;
            this.model.position.z += moveZ;
            this.updateCameraTarget(moveX, moveZ);
        }
    };
    CharacterControls.prototype.updateCameraTarget = function(moveX, moveZ) {
        // move camera
        this.camera.position.x += moveX;
        this.camera.position.z += moveZ;
        // update camera target
        this.cameraTarget.x = this.model.position.x;
        this.cameraTarget.y = this.model.position.y + 1;
        this.cameraTarget.z = this.model.position.z;
        this.orbitControl.target = this.cameraTarget;
    };
    CharacterControls.prototype.directionOffset = function(keysPressed) {
        var directionOffset = 0; // w
        if (keysPressed[utils_1.W]) {
            if (keysPressed[utils_1.A]) {
                directionOffset = Math.PI / 4; // w+a
            }
            else if (keysPressed[utils_1.D]) {
                directionOffset = -Math.PI / 4; // w+d
            }
        }
        else if (keysPressed[utils_1.S]) {
            if (keysPressed[utils_1.A]) {
                directionOffset = Math.PI / 4 + Math.PI / 2; // s+a
            }
            else if (keysPressed[utils_1.D]) {
                directionOffset = -Math.PI / 4 - Math.PI / 2; // s+d
            }
            else {
                directionOffset = Math.PI; // s
            }
        }
        else if (keysPressed[utils_1.A]) {
            directionOffset = Math.PI / 2; // a
        }
        else if (keysPressed[utils_1.D]) {
            directionOffset = -Math.PI / 2; // d
        }
        return directionOffset;
    };
    return CharacterControls;
})();
exports.CharacterControls = CharacterControls;