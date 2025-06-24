// child.js
class Child {
  constructor(parent, boxColor = "#35c48e") {
    // Dynamically create the box div
    this.box = document.createElement("div"); // first attribute of class Child, created a div
    this.box.className = "box"; // className="box" to inject .box class of css
    this.parent = parent.getBackgroundElement(); // second attribute of class Child
    parent.getBackgroundElement().appendChild(this.box);

    // Set Color
    this.box.style.backgroundColor = boxColor; // Note: suppose style.css has box me color=red defined but here in child.js we do color=blue // then color = blue bnega as child.js is more internal, child.js would do override

    // Drag state
    this.isDragging = false; // third attribute of class Child
    this.offsetX = 0; //Stores the horizontal distance (in pixels) between the mouse pointer and the left edge of the box when dragging starts.
    this.offsetY = 0;

    // Event listeners
    this.box.addEventListener("pointerdown", this.onPointerDown.bind(this));
    document.addEventListener("pointermove", this.onPointerMove.bind(this));
    document.addEventListener("pointerup", this.onPointerUp.bind(this));

    window.addEventListener("resize", () => this.clampBoxToParent()); // THIS func runs whenEver screen is resized
    // when the screen was getting resized (manually) then box was going outside the bg, so to prevent it we made clampBoxToParent() function
    // i.e.. box ka clamping onResize par bhi likhna h, and onPointerMove par bhi likhna hai
    // two times same mam-min logic
  }

  // clampBoxToParent() {
  //   this.parent.style.height = "30vh";
  //   this.parent.style.width = "30vw";
  //   const boxWidth = this.box.offsetWidth;
  //   const boxHeight = this.box.offsetHeight;

  //   // Get current position
  //   let left = parseFloat(this.box.style.left) || 0;
  //   let top = parseFloat(this.box.style.top) || 0;

  //   // Clamp so box stays inside parent
  //   const maxX = this.parent.offsetWidth - boxWidth;
  //   const maxY = this.parent.offsetHeight - boxHeight;

  //   left = Math.max(0, Math.min(left, maxX));
  //   top = Math.max(0, Math.min(top, maxY));

  //   this.box.style.left = `${left}px`;
  //   this.box.style.top = `${top}px`;
  // }

  // Now while resizing the window size, box was keeping inside the bg, but when bg going outside screen then box also gone outside screen
  // so we want box inside screen as well. Only 'keeping inside bg' is not enough, 'keep the box inside the screen' as well.// so above clamp function is changed to below
  clampBoxToParent() {
    const parentRect = this.parent.getBoundingClientRect();
    const boxWidth = this.box.offsetWidth;
    const boxHeight = this.box.offsetHeight;

    // Get current position
    let left = parseFloat(this.box.style.left) || 0;
    let top = parseFloat(this.box.style.top) || 0;

    // Calculate visible area (intersection of parent and viewport)
    const visibleLeft = Math.max(0, parentRect.left);
    const visibleTop = Math.max(0, parentRect.top);
    const visibleRight = Math.min(window.innerWidth, parentRect.right);
    const visibleBottom = Math.min(window.innerHeight, parentRect.bottom);

    const visibleWidth = visibleRight - visibleLeft;
    const visibleHeight = visibleBottom - visibleTop;

    // Clamp so box stays inside both parent and viewport
    const maxX = visibleWidth - boxWidth;
    const maxY = visibleHeight - boxHeight;

    // Adjust left/top relative to parent
    left = Math.max(visibleLeft - parentRect.left, Math.min(left, maxX));
    top = Math.max(visibleTop - parentRect.top, Math.min(top, maxY));

    this.box.style.left = `${left}px`;
    this.box.style.top = `${top}px`;
  }

  onPointerDown(e) {
    this.isDragging = true;
    const rect = this.box.getBoundingClientRect();
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;
    this.box.setPointerCapture(e.pointerId); // Sometimes during fast-dragging, mouse might leave the box while moving fast.Now element will receive: pointermove & pointerup even if the pointer goes outside the element's borders.
  }

  onPointerMove(e) {
    if (!this.isDragging) return;
    // this.box.style.left = (e.clientX - this.offsetX) + "px";
    // this.box.style.top = (e.clientY - this.offsetY) + "px";

    // Box should not go outside its associated bg
    const bg = this.box.parentElement; //ParentElememt is inbuilt fn of javascript to get the parent div of any div
    const bgRect = bg.getBoundingClientRect();
    const boxRect = this.box.getBoundingClientRect(); // we created bgRect and boxRect here (Rect means position)

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
    // this.box.style.cursor = "grab";
  }

  getBoxElement() {
    return this.box;
  }
}
