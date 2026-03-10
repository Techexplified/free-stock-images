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
