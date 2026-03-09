penpot.ui.open("Free Stock Images", "/index.html", {
  width: 500,
  height: 600,
});

penpot.ui.onMessage(async (message) => {
  console.log("Received:", message);

  if (message.type === "insert-image" && message.imageUrl) {
    try {
      // 1) Upload external image to Penpot
      const imageData = await penpot.uploadMediaUrl(
        "stock-image.jpg",
        message.imageUrl,
      );

      // 2) Create rectangle with fixed geometry (no later mutation)
      const width = 800;
      const height = 450;

      const rect = penpot.createRectangle({
        x: penpot.viewport.center.x - width / 2,
        y: penpot.viewport.center.y - height / 2,
        width,
        height,
      });

      // 3) Apply image fill using API's schema
      rect.fills = [
        {
          fillOpacity: 1,
          fillImage: imageData,
        },
      ];

      console.log("✅ Image rectangle created!", rect.fills);
    } catch (error) {
      console.error("❌ Fill error:", error);
    }
  }
});
