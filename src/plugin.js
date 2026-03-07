penpot.ui.open("Free Stock Images", "/index.html", {
  width: 500,
  height: 600,
  modal: true, // Optional: keeps focus
});

// Keep your message handler
penpot.ui.onMessage((message) => {
  if (message.type === "create-rectangle") {
    const shape = penpot.createRectangle();
    shape.x = 100;
    shape.y = 100;
    shape.width = 200;
    shape.height = 100;
  }
});
