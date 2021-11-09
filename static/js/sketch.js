
// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


let video;
let poseNet;
let poses = [];
let img=[];
let hand;
let nose;

function preload(){
  for(let i=0;i<7;i++){
    img[i]=loadImage("img/img"+(i+1)+".png");
  }
}

function setup() {
  createCanvas(document.documentElement.clientWidth, document.documentElement.clientHeight);
  video = createCapture(VIDEO);
  video.size(width*0.6, height*0.7);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
  hand=createVector(-10000,-10000);
  nose=createVector(-10000,-10000);
}

function modelReady() {
  // select('#status').html('Model Loaded');
}

function draw() {
  background(255)
  push()
  translate(width*0.2, height*0.15)
  image(video, -200,0,width*0.6, height*0.7);
  drawPart();
  pop()
  edge()
}

function edge(){
  // image(img[3],0,0,width,height*0.15)
  // image(img[6],0,height*0.85,width,height*0.15)
  // image(img[4],0,height*0.15,width*0.2,height*0.7)
  // image(img[5],width*0.8,height*0.15,width*0.2,height*0.7)
}

function drawPart() {
	for (let i = 0; i < poses.length; i++) {
		let pose = poses[i].pose;
		for (let j = 0; j < pose.keypoints.length; j++) {
			let keypoint = pose.keypoints[j];
			if ((keypoint.part === "rightWrist" || keypoint.part === "leftWrist") && keypoint.score > 0.15) {
				hand.x = keypoint.position.x;
				hand.y = keypoint.position.y;
        push()
        imageMode(CENTER)
        image(img[0],hand.x,hand.y);
        pop()
			}
      if (keypoint.part === "nose" && keypoint.score > 0.15) {
				nose.x = keypoint.position.x;
				nose.y = keypoint.position.y;
        push()
        imageMode(CENTER)
        if(hand.dist(nose)<height*0.35){
          image(img[1],nose.x,nose.y)
        }else{
          image(img[2],nose.x,nose.y)
        }
        pop()
			}
		}
	}
}

