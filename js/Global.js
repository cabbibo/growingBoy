// TODO: Global Loki Character

var G = {};

G.texturesToLoad = [
 
  ['gold'   , 'img/iri/pinkRed.png'],
  ['turq'   , 'img/iri/neonYellowPurp.png'],

  //['sand'  , 'img/normals/moss_normal_map.jpg' ],
 ['sand'  , 'img/normals/sand.png' ],
  //['sand'  , 'img/normals/waternormals.jpg' ],
  //['sand'  , 'img/normals/waternormals.jpg' ],
  //['sand'  , 'img/normals/carbonFiber.png' ],
  ['text'  , 'img/boy.png' ],

]

G.pages   = {};

// Loaded objects that may be
// Used across pages
G.AUDIO     = {};
G.TEXTURES  = {};
G.GEOS      = {};
G.MATS      = {};

G.loader  = new Loader();

G.audio   = new AudioController();
G.shaders = new ShaderLoader( 'shaders' );
G.leap    = new Leap.Controller();
//G.gui     = new dat.GUI({});
G.stats   = new Stats();

G.tmpV3   = new THREE.Vector3();
G.tmpV2   = new THREE.Vector2();



// Just something to make things flow
G.flow = new THREE.Vector3();


G.loader.onStart = function(){

  this.onResize();
  this.init();
  this.animate();

  for( var i = 0; i < this.startArray.length; i++ ){

    this.startArray[i]();

  }

}.bind( G );


G.w             = window.innerWidth;
G.h             = window.innerHeight;
G.windowSize    = new THREE.Vector2( G.w , G.h );
G.dpr           = window.devicePixelRatio || 1;
G.ratio         = G.w / G.h * G.ratio 
G.camera        = new THREE.PerspectiveCamera( 45 * G.ratio  , G.ratio , 10 , 10000 );
G.scene         = new THREE.Scene();
G.renderer      = new THREE.WebGLRenderer(); //autoclear:false\
G.clock         = new THREE.Clock();

G.position      = new THREE.Vector3();

G.controls  = new THREE.TrackballControls( G.camera );

G.camera.position.relative = new THREE.Vector3().copy( G.camera.position );

G.container     = document.getElementById('container' );


// Some Global Uniforms

G.dT      = { type:"f" , value: 0               } 
G.timer   = { type:"f" , value: 0               }
G.t_audio = { type:"t" , value: G.audio.texture }
G.dpr     = { type:"f" , value: window.devicePixelRatio || 1 }

G.paused  = false;

console.log(G.renderer.context.getExtension('OES_standard_derivatives'));

// Get all the fun stuff started

G.renderer.setSize( G.w , G.h );
G.container.appendChild( G.renderer.domElement );
  
G.stats.domElement.id = 'stats';
//document.body.appendChild( G.stats.domElement );

G.leap.connect();
//G.gui.close();
G.scene.add( G.camera );
//G.onResize();

G.tween = TWEEN;

TWEEN.origTween = TWEEN.Tween;
TWEEN.Tween = function (options){
  var res = new TWEEN.origTween(options);
  res.easing(TWEEN.Easing.Quadratic.InOut);
  return res;
};

// Need something to call when started
G.startArray = [];


G.init = function(){

  
  /*
   
    Non Leap interaction

  */
  
  this.iPlane = new THREE.Mesh(
    new THREE.PlaneGeometry( 100000 , 100000 ),
    new THREE.MeshNormalMaterial()
  );
  this.scene.add( this.iPlane );
  this.iPlane.visible = false;
  this.iPlane.faceCamera = true;

  var l = 1000000000;

  this.iObj = new THREE.Object3D();
  this.iObj.position.set( l , l , l );

  this.iPointMarker = new THREE.Mesh(
    new THREE.BoxGeometry( 5 , 5 , 100 ),
    new THREE.MeshBasicMaterial({color:0xffff00})
  );

  //this.iObj.add( this.iPointMarker );
  this.scene.add( this.iObj );

  this.iPoint = this.iObj.position;
  this.iPoint.relative = new THREE.Vector3();
  this.iPoint.relative.copy( this.iPoint );

  this.iDir   = new THREE.Vector3( 0 , 0 , -1 );
  this.iPlaneDistance = 600;


  G.GEOS[ 'icosahedron' ]  = new THREE.IcosahedronGeometry( 1 , 2 );
  G.MATS[ 'normal'      ]  = new THREE.MeshNormalMaterial();


}




G.animate = function(){


  
  if( !this.paused ){

     this.dT.value = this.clock.getDelta();  
  this.timer.value += G.dT.value;

    this.tween.update();



    this.audio.update();


    this.controls.update();
 
    this.stats.update();
    this.renderer.render( this.scene , this.camera );

  }

  //this.stats.update();
  //this.renderer.render( this.scene , this.camera );

  requestAnimationFrame( this.animate.bind( this ) );
  

}

G.updateAttractor = function(){

   if( this.attracting === true ){

    this.attractor.copy( G.iPoint );

  }

  if( (G.timer.value - this.attractionTimer ) > 2.5 ){
  
    this.attracting = true;

  }

  if( this.mani.iPlaneAttracting === true ){

    var d = this.mani.position.clone().sub( this.iPoint ).length();


    if( d < 5 ){

      this.attractor.copy( this.iPoint );

      G.tmpV3.set( 
        (Math.random()-.5) * 1000  , 
        (Math.random()-.5) * 1000  ,
        Math.random() * 500
      );

      G.tmpV3.applyQuaternion( this.iPlane.quaternion );
     // G.tmpV3.multiplyScalar( Math.random() * 500 );
      
      this.attractor.add( G.tmpV3 );


      this.attracting = false;
      this.attractionTimer = G.timer.value

    }

  }


  if( this.sol.maniAttracting === true ){
    
    G.tmpV3.copy( this.mani.position );

    G.tmpV3.sub( this.solAttractor );

   // G.tmpV3.normalize();

    this.solVelocity.add( G.tmpV3 );

    G.tmpV3.copy( this.solVelocity );
    G.tmpV3.normalize();
    G.tmpV3.multiplyScalar( 2.4 );
    this.solAttractor.add( G.tmpV3 );

    this.solVelocity.multiplyScalar( .995 );

  }

 // this.attractorMesh.position.copy( this.attractor );
 // this.solAttractorMesh.position.copy( this.solAttractor );


}


G.addToStartArray = function( callback ){

  this.startArray.push( callback );

}


G.onResize = function(){

  
  this.w = window.innerWidth;
  this.h = window.innerHeight;

  this.windowSize.x = this.w;
  this.windowSize.y = this.h;

  this.ratio = this.w / this.h;

 
  // To try and keep everything neccesary on screen
  this.camera.aspect = this.ratio;
  this.camera.fov    = 60 / Math.pow(this.ratio,.7);   
  this.camera.updateProjectionMatrix();
  this.renderer.setSize( this.w , this.h );

}

G.onKeyDown = function( e ){

  console.log( e.which );
  if( e.which == 32 ){

    this.paused = !this.paused;

  }


   /*if( e.which == 80 ){

    this.paused = true;
      
     var cb = function(){
    
       G.paused = false;

     }.bind( G );
    THREE.renderTiledScene( G.renderer, G.scene,G.camera, 10 , 10 , 'enough' , cb );

  }*/




}
G.loadTextures = function(){

  for( var i = 0; i < G.texturesToLoad.length; i++ ){

    var t = G.texturesToLoad[i];

    this.loadTexture( t[0] , t[1] );

  }

}

G.loadTexture = function( name , file ){

  var cb = function(){
    this.loader.onLoad(); 
  }.bind( this );

  var m = THREE.UVMapping;

  var l = THREE.ImageUtils.loadTexture;

  G.loader.addLoad();
  G.TEXTURES[ name ] = l( file , m , cb );
  G.TEXTURES[ name ].wrapS = THREE.RepeatWrapping;
  G.TEXTURES[ name ].wrapT = THREE.RepeatWrapping;

}

//G.createNextPage

// Some Event Listeners

window.addEventListener( 'resize'   , G.onResize.bind( G )  , false );
window.addEventListener( 'keydown'  , G.onKeyDown.bind( G ) , false );

