// child.js
class Child {
  constructor(parent,boxColor = "#35c48e") {
    // Dynamically create the box div
    this.box = document.createElement("div");
    this.box.className = "box";
    this.parent = parent.getBackgroundElement();
    parent.getBackgroundElement().appendChild(this.box);

    // Initial position
    this.box.style.left = "100px";
    this.box.style.top  = "100px";
    this.box.style.position = "absolute";
    this.box.style.backgroundColor = boxColor;
    // Note: suppose style.css has box me color=red defined but here in child.js we do color=blue
    // then color = blue bnega as child.js is more internal, child.js would do override

    // Drag state
    this.isDragging = false;
    this.offsetX = 0;//Stores the horizontal distance (in pixels) between the mouse pointer and the left edge of the box when dragging starts.
    this.offsetY = 0;

    // Event listeners
    this.box.addEventListener("pointerdown", this.onPointerDown.bind(this));
    document.addEventListener("pointermove", this.onPointerMove.bind(this));
    document.addEventListener("pointerup", this.onPointerUp.bind(this));
  }

  onPointerDown(e) {
    this.isDragging = true;
    this.offsetX = e.clientX - this.box.offsetLeft;
    this.offsetY = e.clientY - this.box.offsetTop;
    this.box.setPointerCapture(e.pointerId);
    this.box.style.cursor = "grabbing";
  }

  onPointerMove(e) {
    if (!this.isDragging) return;
    // this.box.style.left = (e.clientX - this.offsetX) + "px";
    // this.box.style.top = (e.clientY - this.offsetY) + "px";

    // Box should not go outside its associated bg
    const bg = this.box.parentElement;
    const bgRect = bg.getBoundingClientRect();
    const boxRect = this.box.getBoundingClientRect();

    // Calculate new left/top relative to background
    let newLeft = e.clientX - this.offsetX - bgRect.left;
    let newTop = e.clientY - this.offsetY - bgRect.top;
    
    // Clamp values so box stays inside background
    newLeft = Math.max(0, Math.min(newLeft, bgRect.width - boxRect.width));
    newTop = Math.max(0, Math.min(newTop, bgRect.height - boxRect.height));

    this.box.style.left = newLeft + "px";
    this.box.style.top = newTop + "px";
  }

  onPointerUp(e) {
    this.isDragging = false;
    this.box.releasePointerCapture(e.pointerId);
    this.box.style.cursor = "grab";
  }

  getBoxElement() {
    return this.box;
  }
}