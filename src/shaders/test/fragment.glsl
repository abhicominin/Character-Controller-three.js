precision mediump float;

uniform vec3 uColor;
uniform sampler2D uTexture;// Specific type for texture

varying vec2 vUv;// uv is vector2 type
varying float vElevation;
//varying float vrandom;// Way of importing varying into fragment shader from vertex shader 

void main() 
{
    vec4 texturecolor = texture2D(uTexture,vUv);
    texturecolor.rgb *= vElevation * 2.0 + 0.7; // texture2D returns a vec4
    gl_FragColor = texturecolor;

    //gl_FragColor = vec4(vUv,1.0,1.0);



}