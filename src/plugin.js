penpot.ui.open("Free Stock Images", "/index.html", {
  width: 500,
  height: 700,
});

penpot.ui.onMessage(async (message) => {
  console.log("Received:", message);

  if (message.type === "insert-image" && message.imageUrl) {
    try {
      const imageData = await penpot.uploadMediaUrl(
        "stock-image.jpg",
        message.imageUrl,
      );

      // FULL ORIGINAL SIZE
      const width = message.width || 800;
      const height = message.height || 600;

      const rect = penpot.createRectangle();

      rect.name = `Image by ${message.photographer}`;
      rect.resize(width, height);

      rect.fills = [
        {
          fillOpacity: 1,
          fillImage: imageData,
        },
      ];

      console.log("✅ Rectangle created.");
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }
});

penpot.ui.onMessage(async (message) => {
  if (message.type === "set-background" && message.imageUrl) {
    try {
      const imageData = await penpot.uploadMediaUrl(
        "background-image.jpg",
        message.imageUrl,
      );

      const pageBounds = penpot.viewport.bounds; // full page area

      const bg = penpot.createRectangle();

      bg.x = pageBounds.x;
      bg.y = pageBounds.y;

      bg.resize(pageBounds.width, pageBounds.height);
      // bg.width = pageBounds.width;
      // bg.height = pageBounds.height;

      bg.fills = [
        {
          fillOpacity: 1,
          fillImage: imageData,
        },
      ];

      // Move behind everything else
      bg.setIndex(0);

      console.log("✅ Background rectangle created");
    } catch (err) {
      console.error("Failed to set background:", err);
    }
  }
});
