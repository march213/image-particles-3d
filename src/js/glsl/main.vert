uniform float uPointSize;
uniform float uProgress;
uniform float uFrequency;
uniform float scale;

varying vec2 vTextureCoord;

attribute vec3 initialPosition;

void main() {
	#include <begin_vertex>

  transformed = initialPosition + ((position - initialPosition) * uProgress);
  transformed.z += sin(transformed.x * uFrequency);

	#include <project_vertex>

	gl_PointSize = uPointSize;

  vTextureCoord = position.xy;
}