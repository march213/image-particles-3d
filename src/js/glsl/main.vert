uniform float uPointSize;
uniform float scale;

varying vec2 vTextureCoord;

void main() {
	#include <begin_vertex>
	#include <project_vertex>

	gl_PointSize = uPointSize;

  vTextureCoord = position.xy;
}