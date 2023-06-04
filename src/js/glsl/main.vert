uniform float uPointSize;
uniform float scale;

varying vec2 vTextureCoord;

attribute vec3 initialPosition;

void main() {
	#include <begin_vertex>

  transformed += initialPosition;

	#include <project_vertex>

	gl_PointSize = uPointSize;

  vTextureCoord = position.xy;
}