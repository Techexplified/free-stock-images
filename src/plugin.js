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

      // FORCE ON-CANVAS: Top-left quadrant, visible
      const x = 50;
      const y = 50;

      console.log(`Creating ${width}x${height} at (${x}, ${y})`);

      const rect = penpot.createRectangle({
        x,
        y,
        width,
        height,
      });

      rect.fills = [
        {
          fillOpacity: 1,
          fillImage: imageData,
        },
      ];

      console.log("✅ Rect created. Check layers panel for size.");
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }
});
