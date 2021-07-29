//indexedDB ko open kr rhe
let req = indexedDB.open("gallery", 1);
let database;
let numberOfMedia = 0;//no of media we have previously stored
//if access allow hua tow yee func chlega
req.addEventListener("success", function () {
    //result ko store kr rhe
  database = req.result;
  console.log(database);
});

//if kuch change krnge tow yee func chlega success wale se phle
req.addEventListener("upgradeneeded", function () {
    //result ko store kr rhe
  let db = req.result;
  //gallery ke andr object bna rhe
  db.createObjectStore("media", { keyPath: "mId" });
});

//if access nhi mili tow yee func chlega
req.addEventListener("error", function () {});

//function to save media in this
function saveMedia(media) {
    //if access nhi mili tow return kr jao yahi se
  if (!database) return;
  //object ke andr store kr rhe
  let data = {
     mId: Date.now(),
     mediaData: media,
   };
  //making transaction of readwrite type
  let tx = database.transaction("media", "readwrite");
  //access le rhe 
  let mediaobjectStore = tx.objectStore("media");
  //data ko object mein daal rhe
  mediaobjectStore.add(data);
}

//implementing view on gallery page
function viewMedia() {
    //if database nhi hai tow return kr jao
    if (!database) return;
    //selecting gallery-container
    let galleryContainer = document.querySelector(".gallery-container");
    //making transaction of readonly type
    let tx = database.transaction("media", "readonly");
    //access le rhe 
    let mediaobjectStore = tx.objectStore("media");
    //uss object ke cursor rakh rhe jo travel krega starting from 0 position 
    let req = mediaobjectStore.openCursor();
    //uss cursor ki functionality implement kr rhe
    req.addEventListener("success", function () {
        //cursor jisko point kr rha hai usse select kr rhe
        cursor = req.result;
        if (cursor) {
         numberOfMedia++;
         //is cursor kisi pr hai tow div bna rhe
         let mediaCard = document.createElement("div");
         //uski class list mein media-card daal rhe
         mediaCard.classList.add("media-card");
         //media-card ka HTML code
         mediaCard.innerHTML = `<div class="actual-media"></div>
         <div class="media-buttons">
             <button class="media-download">Download</button>
             <button data-mid = "${cursor.value.mId}" class="media-delete">Delete</button>
         </div>`;
         //data ke andr cursor ki value ke andr jo media hai usse le rhe
         let data = cursor.value.mediaData;
         //selecting actual-media(jaha img and vdo dikhngi)
         let actualMediaDiv = mediaCard.querySelector(".actual-media");
         //selecting download btn
         let downloadBtn = mediaCard.querySelector(".media-download");
         //selecting delete btn
         let deleteBtn = mediaCard.querySelector(".media-delete");
         //implementing delete btn
         deleteBtn.addEventListener("click", function (e) {
             //getting mId of current object
             let mId = Number(e.currentTarget.getAttribute("data-mid"));
             //deleting media using mId
             deleteMedia(mId);
             //removing it from UI by deleting delete btn parent ke parent ko i.e mediaCard
             e.currentTarget.parentElement.parentElement.remove();
            });
         //type ke andr current media ka type 
         let type = typeof data;
         //if typr string hai then it is an image
         if (type == "string") {
           //image
           //creting image element
         let image = document.createElement("img");
         //image ke source mein media ka data daal rhe
          image.src = data;
          //implementing download btn for images
          downloadBtn.addEventListener("click", function () {
              //calling download function with current data and type=image as parameters
              downloadMedia(data, "image");
            });
          //actual-media ke andr image element ko daal rhe
          actualMediaDiv.append(image);
        } 
        
        else if (type == "object") {
           //if typr string hai then it is an image
           //video
           //creating video element
           let video = document.createElement("video");
           //media ke data se url bna rhe coz seedha blob ko uske sorce 
           //mein nhi daal skte so as url dalnge
           let url = URL.createObjectURL(data);
           //putting data url in video source
           video.src = url;
           //implementing download btn for videos
          downloadBtn.addEventListener("click", function () {
              //calling download function with current data and type=video as parameters
              downloadMedia(url, "video");
            });
          //video mute,autoplay,and controls attribute ke saath hogi
          video.autoplay = true
          video.loop = true 
          video.controls = true
          video.muted = true
          //actual-media mein video element daal rhe
          actualMediaDiv.append(video);
        }
        //jo media card bna hai usse gallery-container ke andr daal rhe
        galleryContainer.append(mediaCard);
        //cursor ko next position in object pr point krva rhe
        cursor.continue();
      }else{
          //if cursor kisi ko bhi point nhi kr rha
        if(numberOfMedia==0){
            //galery page pr no media msg dikha do
            galleryContainer.innerText = "No media present";
        }
      }
    });
}

//function to implement download btn(download media)
function downloadMedia(url, type) {
    //creating anchor element
    let anchor = document.createElement("a");
    //giving anchor href url
    anchor.href = url;
    //if type is image anchor will download image.png
    //else if type is video anchor will download video.mp4
    if (type == "image") {
      anchor.download = "image.png";
    } else {
      anchor.download = "video.mp4";
    }
    //on click it will download
    anchor.click();
    //after download we don't need that anchor element so removing it
    anchor.remove();
}

//function to implement delete btn(delete media)
function deleteMedia(mId) {
    //making tranaction type readwrite
    let tx = database.transaction("media", "readwrite");
    //getting access
    let mediaStore = tx.objectStore("media");
    //deleting that media by passing its mId
    mediaStore.delete(mId);
}