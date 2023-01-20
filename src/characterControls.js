// This class will implement the state machine which will be used for the transition from one state to another and to move the character with the camera based on which keys are pressed
import * as THREE from 'three'
import { EqualStencilFunc } from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { DIRECTIONS, Utils } from "./utils"


var CharacterControls = /** @class */( function () { // ES6 standard way of creating a class in javascript where the function followed by /** @class */ will be treated as a class and the function next to it will be a constructor function

    function CharacterControls( // Constructor function
        model,
        mixer,
        animationmap,
        orbitControl,
        camera,
        currentAction
    ){

        // TEMPORARY DATA FOR MATH CALCULATION
        this.walkDirection = new THREE.Vector3()
        this.rotateAngle = new THREE.Vector3(0, 1 ,0)
        this.rotateQuaternion = new THREE.Quaternion()
        this.cameraTarget = new THREE.Vector3()

        // CONSTANT DATA
        this.fadeDuration = 0.2
        this.runVelocity = 5
        this.walkVelocity = 2

        this.toggleRun = true
        this.model = model
        this.mixer = mixer
        this.animationmap = animationmap
        this.animationmap.forEach( function( value,key ) {

            if( key == currentAction )
            {
                value.play()
            }
            
        })
        this.orbitControl = orbitControl
        this.camera = camera

    }

    // METHODS
    
    CharacterControls.prototype.switchRunToggle = function() { // Method to toggle between run and walk
      
          this.toggleRun = !this.toggleRun

    }

    CharacterControls.prototype.update = function( delta , keysPressed ) { // Method update which will be called every frame to update state with delta time and on the basis of the key pressed
          
          const directionPressed = Utils.DIRECTIONS.some( function(key) { // To check if any of W,A,S,D key has been pressed

              return keysPressed(key) == true

          })

          // TO DETERMINE WHETHER NEXT STATE MUST BE IDLE,WALK,RUN
          var play = ''
          if( directionPressed && this.toggleRun)
          {
            play = 'Run'
          }
          else if( directionPressed )
          {
            play = 'Walk'
          }
          else
          {
            play = 'Idle'
          }

          if( this.currentAction != play ) // To check if current state is same as that of the state just determined
          {

             const toPlay = this.animationmap.get(play) // current animation
             const current = this.animationmap.get(this.currentAction) // next animation

             current.fadeOut(this.fadeDuration) // Tell the current animation to fade out
             toPlay.reset().fadeIn(this.fadeDuration).play() // Tell the next animation to fade in

             this.currentAction = play // Store my new State

             // TILL NOW CHARACTER HAVE NO DIRECTION 

          }

          this.mixer.update( delta )

          if( this.currentAction == 'Run' || this.currentAction == 'Walk') // I know if the character is in run or walk state I must change the Direction
          {
             // Calculate towards camera direction angle ( to make character face camera view )
            var anglebtwcamerachar = Math.atan2(
                ( this.camera.position.x - this.model.position.x),
                ( this.camera.position.z - this.model.position.z)
            )
 
             // Direction offset
            var directionOffset = this.directionOffset( keysPressed ) 

             // Rotate Model
            this.rotateQuaternion.setFromAxisAngle(this.rotateAngle , anglebtwcamerachar + directionOffset )
            this.model.quaternion.rotateTowards( this.rotateQuaternion , 0.2) // Rotating in step-wise to create a smooth rotate effect 
            
             // Calculate Directions
            this.camera.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle( this.rotateAngle , directionOffset)
            
             // Run/Walk Velocity
            const velocity = this.currentAction == 'Run' ? this.runVelocity : this.walkVelocity
            
             // move model
            const moveX = this.walkDirection.x * velocity * delta
            const moveZ = this.walkDirection.z * velocity * delta

            this.model.position.x += moveX
            this.model.position.z += moveZ
            
            // Passing these values to updateCameraTarget
            this.updateCameraTarget( moveX , moveZ)

          }

    }


    CharacterControls.prototype.updateCameraTarget( function( moveX , moveZ ){

            // move camera
            this.camera.position.x = moveX
            this.camera.position.z = moveZ

            // update camera target
            this.cameraTarget.x = this.model.position.x
            this.cameraTarget.y = this.model.position.y + 1
            this.cameraTarget.z = this.model.position.z
            this.orbitControl.target = this.cameraTarget 
    })

    CharacterControls.prototype.directionoffset( function( keysPressed ) {

         // Calculating Direction Offset logic for W,W+A,W+S,S+D,A+D
         var directionoffset = 0

         if(keysPressed[W])
         {
             if(keysPressed[A])
             {
                 directionoffset = Math.PI / 4 // W+A
             }
             else
             {
                 directionoffset = -Math.PI / 4 // W+D
             }
         }
         else if(keysPressed[S])
         {
             if(keysPressed[A])
             {
                 directionoffset =  Math.PI/2 + Math.PI/4       // S+A
             }
             else if(keysPressed[D])
             {
                 directionoffset =  -Math.PI/2 - Math.PI/4       // S+D
             }
             else
             {
                 directionoffset =  Math.PI       // S
             }
         }
         return directionoffset

    })
    


    
    return CharacterControls // Constructor function returning the definition of the class CharacterControls

})()

exports.CharacterControls = CharacterControls 
