uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec2 uFrequency;
uniform float uTime;

attribute vec3 position;// The same attribute which we provide while creating buffer geometry
attribute float aRandom;// Because we have kept one value per vertices while setting attribute aRandom
attribute vec2 uv;

varying vec2 vUv;
varying float vElevation;
//varying float vrandom;

void main() {
     
    vec4 modelposition = modelMatrix * vec4(position , 1.0);
    float elevation = sin(modelposition.x * uFrequency.x - uTime) * 0.1;
    elevation += sin(modelposition.y * uFrequency.y - uTime) * 0.1;
    //modelposition.z += sin(modelposition.x * uFrequency.x - uTime) * 0.1;
    //modelposition.z += sin(modelposition.y *uFrequency.y - uTime) * 0.1;
    modelposition.y *= 0.5;
    modelposition.z += elevation;

    vec4 viewposition = viewMatrix * modelposition;
    vec4 projectedposition = projectionMatrix * viewposition;

    gl_Position = projectedposition;

    //vrandom = aRandom;
    vUv = uv;
    vElevation = elevation;


    //gl_Position = projectionMatrix * modelMatrix * viewMatrix * vec4(position , 1.0);
}