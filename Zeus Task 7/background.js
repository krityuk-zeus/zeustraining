// background.js
class Background {
  constructor() {
    // Dynamically create the background div
    this.bg = document.createElement("div");
    this.bg.className = "background";
    document.body.appendChild(this.bg); // injecting the bg tag into body tag
    
    // document.querySelector(".Container").appendChild(this.bg); //  injecting the bg tag into .container tag

    

  }
  getBackgroundElement() {
    return this.bg;
  }
  
}