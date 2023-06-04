uniform float uPointSize;
uniform float uProgress;
uniform float scale;

varying vec2 vTextureCoord;

attribute vec3 initialPosition;

void main() {
	#include <begin_vertex>

  transformed = initialPosition + ((position - initialPosition) * uProgress);

	#include <project_vertex>

	gl_PointSize = uPointSize;

  vTextureCoord = position.xy;
}