//video tag ko select kr rhe
let videoPlayer = document.querySelector("video");
//selecing record button
let recordBtn = document.querySelector("#record");
//selecting capture button
let captureBtn = document.querySelector("#capture");
//selecting body
let body = document.querySelector("body");
let mediaRecorder;
let chunks = [];//object for small parts of videos stored by mediaREcorder
let isRecording = false;
let filter = "";//filter is initially empty i.e normal filter
let currZoom = 1; // min = 1 and max = 3
let zoomIn = document.querySelector(".in");//selecting zoomIn btn
let zoomOut = document.querySelector(".out");//selecting zoomOut btn
let galleryBtn = document.querySelector("#gallery");//selecting gallery btn
//implementing gallery btn
galleryBtn.addEventListener("click", function () {
  //domain/path mein path mein index.html ki jagha gallery.html kr rhe
  location.assign("gallery.html");
});
//implementing zoomIn functionality
zoomIn.addEventListener("click", function () {
  //click krne pr current zoom ko 0.1 badha do 
  currZoom = currZoom + 0.1;
  //if zoom 3 se zayda ho gya hai tow usse kam krke 3 kr do
  if (currZoom > 3) currZoom = 3;
  //console.log(currZoom);
  //video tag ke style mein transform property mein current zoom daal do as value 
  videoPlayer.style.transform = `scale(${currZoom})`;
});
//implementing zoomOut functionality
zoomOut.addEventListener("click", function () {
  //click krne pr current zoom ko 0.1 kam do 
  currZoom = currZoom - 0.1;
  //if zoom 1 se kam ho gya hai tow usse kam zayda 1 kr do
  if (currZoom < 1) currZoom = 1;
  //console.log(currZoom);
  //video tag ke style mein transform property mein current zoom daal do as value
  videoPlayer.style.transform = `scale(${currZoom})`;
});
//selecting all filter in filters div
let allFilters = document.querySelectorAll(".filter");
for (let i = 0; i < allFilters.length; i++) {
    //all filter pr addEventListener lga rhe
    allFilters[i].addEventListener("click", function (e) {
      //if filter-div ki class hai tow select kr rhe
      let previousFilter = document.querySelector(".filter-div");
      //if filter-div class phle se hai so remove krnge coz phle
      //filter haat jaye next filter lagane se phle
      if (previousFilter) previousFilter.remove();
      //color select kr lia current backgrounf color se
      let color = e.currentTarget.style.backgroundColor;
      //filter ke andr current color daal dia
      filter = color;
      //creating a new div
      let div = document.createElement("div");
      //putting filter-div class in that div
      div.classList.add("filter-div");
      //uss div ko css mein fixed kr dia and max height and width de di
      //and uss div ke background color ke div mein current color daal dia
      div.style.backgroundColor = color;
      //usse div ke andr daal dia 
      body.append(div);
    });
}

//implementing capture button
captureBtn.addEventListener("click", function () {
    //selecting span inside capture btn
    let innerSpan = captureBtn.querySelector("span");
    //captur btn click hone pr animation chalao by adding class
    innerSpan.classList.add("capture-animation");
    //1sec baad pic captured and thus no animation needed so remove class
    setTimeout(function () {
    innerSpan.classList.remove("capture-animation");
    }, 1000);
    //creating canvas
    let canvas = document.createElement("canvas");
    //giving canvas height and width of video height and width
    canvas.width = videoPlayer.videoWidth; 
    canvas.height = videoPlayer.videoHeight;
  
    let tool = canvas.getContext("2d");
    //top left to center(if zoom hua hai tow image draw krne se phle stretch kr do)
    //stretch kra taaki clicked image zoomed aye
    tool.translate(canvas.width / 2, canvas.height / 2);
    //zoom basically stretch kra canvas ko
    tool.scale(currZoom, currZoom);
    //wapi top left pr leaye origin
    tool.translate(-canvas.width / 2, -canvas.height / 2);
    //drewing image of current frame in video
    tool.drawImage(videoPlayer, 0, 0);
    //if filter mein koi filter hai tow uss filter-div ko canvas ki height and width
    //de di taki image capture krne se phle vo filter lg jaye
    if (filter != "") {
        tool.fillStyle = filter;
        tool.fillRect(0, 0, canvas.width, canvas.height);
      }
    //making URL from canvas
    let url = canvas.toDataURL();
    //removing canvas coz video se image click kr li hai uska URL bna lia so don't need it
    canvas.remove();
    //saving media in indexedDB database
    saveMedia(url);
    // //creating anchor tag and giving URL to that then downloading image
    // let a = document.createElement("a");
    // a.href = url;
    // a.download = "image.png";
    // //on click image will download
    // a.click();
    // //removing anchor tag coz image download kr li hai so don't need it
    // a.remove();
  });

//implementing recording video button using this addeventlistener
recordBtn.addEventListener("click", function () {
    //selecting span inside record btn
   let innerSpan = recordBtn.querySelector("span");
   //selecting if phle se filter mein filter hai
   let previousFilter = document.querySelector(".filter-div");
   //if phle se filter div hai tow usse remove kr rhe class ko remove krke
   //and filter ko empty kr rhe coz video recording mein bohot saari images hongi
   //so yee div kaam nhi ayega and uske liye matrixses uss hongi
   if (previousFilter) previousFilter.remove();
   filter = "";
   if(isRecording){
      //recording ko stop krna h
      mediaRecorder.stop();
      isRecording = false;
      //no need of animation when video is recorded so removing class
      innerSpan.classList.remove("record-animation");
   }else{
      //recording shuru krni hai 
      mediaRecorder.start();
      //recording mein stretch zoom applicable nhi hai so current zoom ko 1 kr dia(normal)
      currZoom = 1;
      //video tag ke style mein jakr transform ka scale normal kr dia(current zoom dalkr jo abhi normal hai)
      videoPlayer.style.transform = `scale(${currZoom})`;
      isRecording = true;
      //when video is recording need animation so adding class
      innerSpan.classList.add("record-animation");
   }
});
//getting permission using browser popup by "navigator" obect of browser
//having subobject->"mediaDevices" which have function getUserMedia
  let promiseToUseCamera = navigator.mediaDevices.getUserMedia({
    //bydefault->false
  video: true,
  audio: true,
});

//using promise coz permission get krne mein time lgta hai so jaise hi access hoga 
//promise run hoga
//As we don't have a URL or link of video we will use mediaStream that is a bydefault object
// which stores continuous video and audio from camera
promiseToUseCamera
  .then(function (mediaStream) {
      //if user gives access to video and audio then function will execute
  videoPlayer.srcObject = mediaStream;
    //   console.log("User has given access to use the camera");
    //   console.log(mediaStream);

    //creating a new mediaRecorder object
    mediaRecorder = new MediaRecorder(mediaStream);
    
    //pushing all chunks of videos into an array  using "DATAAVAILABLE" event of mediaRecorder
    mediaRecorder.addEventListener("dataavailable", function (e) {
      chunks.push(e.data);
    });

    mediaRecorder.addEventListener("stop", function (e) {
      //creating a new blob which is a raw large file and storing all chunks in it
      let blob = new Blob(chunks, { type: "video/mp4" });
      //empting chunks array after storing it in a single blob 
      chunks = [];
      //saving in indexedDB database
      saveMedia(blob);
      // //blob ki link bnadi h
      // let link = URL.createObjectURL(blob); 
      // //creating an anchor tag and giving it href that is our link
      // let a = document.createElement("a");
      // a.href = link;
      // //downloading in in form of .mp4 with name video
      // a.download = "video.mp4";
      // //on click video will download
      // a.click();
      // //removing anchor tag coz video download kr li hai so don't need it
      // a.remove();

    });
  })
  .catch(function () {
      //if user denies then this catch function will execute
    console.log("user has denied the access of camera");
  });