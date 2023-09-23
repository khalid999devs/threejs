varying vec2 vertexUV;
//more
varying vec3 vertexNormal;

void main(){
 vertexUV=uv;
 //more
 vertexNormal=normalize(normalMatrix * normal);
 //more
 gl_Position=projectionMatrix* modelViewMatrix * vec4(position,1.0);
}

