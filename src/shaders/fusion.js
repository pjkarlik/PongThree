/* eslint-disable */
THREE.RenderFragment = {
  uniforms: {

    "tDiffuse": { value: null },
    "tSize":    { value: new THREE.Vector2( 512, 512 ) },
    "center":   { value: new THREE.Vector2( 0.5, 0.5 ) },
    "ratio":    { value: 1024.0 },
    "time":     { value: 0.0 },
    "scale":    { value: 2.0 }

  },

  vertexShader: [

    "varying vec2 vUv;",
    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join( "\n" ),

  fragmentShader: [

    "uniform vec2 center;",
    "uniform float scale;",
    "uniform float ratio;",
    "uniform float time;",
    "uniform float frenz;",
    "uniform vec2 tSize;",
    "uniform sampler2D tDiffuse;",
    "varying vec2 vUv;",


    "void main() {",
      "vec2 q = vUv;",
      "float df = time * 0.1;",

      "vec4 color = texture2D( tDiffuse, q );",
  
      "gl_FragColor = vec4( ",
      "color.r,",
      "color.g,",
      "color.b,",
      "color.a);",
    "}"

  ].join( "\n" )

};
