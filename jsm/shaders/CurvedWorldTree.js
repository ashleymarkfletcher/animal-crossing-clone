var CurvedWorldTree = {
	// fog: true,
	uniforms: {
		// tDiffuse: { value: null },
		// opacity: { value: 1.0 },
		// texture: {
		// 	type: "t",
		// 	value: new THREE.TextureLoader().load(
		// 		"../../textures/animalCrossingGrass.png"
		// 	),
		// },
		// textRepeat: {
		// 	type: "f",
		// 	value: 8,
		// },
	},

	// position = vec3 of vertex
	// normal is vec3 of vertex normal
	// cameraPosition vec3

	// vertexShader: [
	// 	"varying vec2 vUv;",

	// 	"void main() {",

	// 	"	vUv = uv;",
	// 	"	//gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

	// 	`

	// 	float curve = 0.001;

	// 	vec3 p = position;

	// 	// worldPosition of vertex not projected by camera
	// 	vec4 vv = modelMatrix * vec4(position, 1.0);

	// 	// vertex postion projected to camera space
	// 	//gl_Position = projectionMatrix * vv;

	// 	// Now adjust the coordinates to be relative to the camera position
	// 	//vv -= vec4(cameraPosition,0.0) + vec4(0,0,-100,0);
	// 	//vv.xyz -= cameraPosition + vec3(0,0,-10);

	// 	vv.xyz -= cameraPosition ;

	// 	// Reduce the y coordinate (i.e. lower the "height") of each vertex based
	// 	// on the square of the distance from the camera in the z axis, multiplied
	// 	// by the chosen curvature factor
	// 	vv = vec4(0.0, (vv.z*vv.z) * -curve, 0.0, 0.0);

	// 	// Now apply the offset back to the vertices in model space
	// 	//gl_Position += vv;

	// 	//vec4 unprojected = vv / modelViewMatrix;
	// 	//p += unprojectd.xyz;

	// 	// p += vv.xyz;
	// 	// gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );

	// 	gl_Position = projectionMatrix *viewMatrix* ((modelMatrix * vec4( position, 1.0)) + vv);
	// 	// gl_Position = projectionMatrix * modelViewMatrix * vec4( position+vec3(0,0.1,0) , 1.0);

	// 	//position += mul(_World2Object, vv);
	// 	`,
	// 	"}",
	// ].join("\n"),

	vertexShader: [
		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	//gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		`

		float curve = 2.5;
		float curveDistance = 50.0;

		vec3 VERTEX = position.xyz;

		// worldPosition of vertex not projected by camera
		vec4 vv = modelMatrix * vec4(position, 1.0);

		// NORMAL = (WORLD_MATRIX * vec4(NORMAL, 0.0)).xyz;

		float dist = length(cameraPosition.z - vv.z) / curveDistance;

		 vv.y -= pow(dist, curve);

		//  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );

		gl_Position = projectionMatrix * viewMatrix * vv;
		`,
		"}",
	].join("\n"),

	fragmentShader: [
		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"uniform float tileFactor;",

		"varying vec2 vUv;",

		`
		// 2D Random
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}
		// 2D Noise based on Morgan McGuire @morgan3d
		// https://www.shadertoy.com/view/4dS3Wd
		float noise (in vec2 st) {
			vec2 i = floor(st);
			vec2 f = fract(st);
		
			// Four corners in 2D of a tile
			float a = random(i);
			float b = random(i + vec2(1.0, 0.0));
			float c = random(i + vec2(0.0, 1.0));
			float d = random(i + vec2(1.0, 1.0));
		
			// Smooth Interpolation
		
			// Cubic Hermine Curve.  Same as SmoothStep()
			vec2 u = f*f*(3.0-2.0*f);
			// u = smoothstep(0.,1.,f);
		
			// Mix 4 coorners percentages
			return mix(a, b, u.x) +
					(c - a)* u.y * (1.0 - u.x) +
					(d - b) * u.x * u.y;
		}

		vec3 rgb2hsb( in vec3 c ){
			vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
			vec4 p = mix(vec4(c.bg, K.wz),
						 vec4(c.gb, K.xy),
						 step(c.b, c.g));
			vec4 q = mix(vec4(p.xyw, c.r),
						 vec4(c.r, p.yzx),
						 step(p.x, c.r));
			float d = q.x - min(q.w, q.y);
			float e = 1.0e-10;
			return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
						d / (q.x + e),
						q.x);
		}
		`,

		"void main() {",

		"	vec4 texel = texture2D( tDiffuse, vUv  );",
		"	gl_FragColor =  texel;",
		`//gl_FragColor = vec4(vec3(vUv.y),1.0); 
		
		// green flat colour
	// 	vec3 base = vec3(0.16078 , 0.55294,  0.31373);
	// 	vec2 st = vUv*8.0;

    // // Scale the coordinate system to see
    // // some noise in action
	// vec2 pos = vec2(st*8.0);
	
	// vec4 base4 = vec4(base, 1.0);

    // // Use the noise function
    // float n = 1.0-noise(pos);
	// // float n = noise(pos);

	// // gl_FragColor = vec4(vec3(n), 1.0) +vec4(base, 1.0)* texel;
	// // gl_FragColor = vec4(base, 1.0)+vec4(vec3(n), 1.0);
	// // gl_FragColor = vec4(texel.xyz, n) ;

	// // mix the base green with the texture based on the random noise 
	// // this gives darker/lighter spots to show less texture
	// gl_FragColor = mix(base4,texel, n );


	if ( gl_FragColor.a < 0.5 ) discard; 

	//THIS IS FOG!!!
	float depth = gl_FragCoord.z / gl_FragCoord.w;
	float fogFactor = smoothstep( 100.0, 600.0, depth );

	gl_FragColor = mix( gl_FragColor, vec4( vec3(1.0), gl_FragColor.w ), fogFactor );
		
		`,
		"}",
	].join("\n"),
};

export { CurvedWorldTree };
