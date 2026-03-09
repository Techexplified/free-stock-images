import { useState, useEffect } from "react";
import {
  Search,
  Grid,
  ChevronDown,
  Download,
  Bookmark,
  Image as ImageIcon,
  Maximize,
  Hash,
} from "lucide-react";

const recentImages = [
  {
    id: 1,
    name: "John Doe",
    size: "4K",
    source: "PEXELS",
    color: "bg-[#2a2a35]",
  },
  {
    id: 2,
    name: "Jane Smith",
    size: "HD",
    source: "UNSPLASH",
    color: "bg-[#2a1d35]",
  },
  {
    id: 3,
    name: "Mike Johnson",
    size: "FHD",
    source: "PIXABAY",
    color: "bg-[#1d2a35]",
  },
  {
    id: 4,
    name: "Sarah Lee",
    size: "2K",
    source: "PEXELS",
    color: "bg-[#2a2525]",
  },
];

function App() {
  // 1. State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [provider, setProvider] = useState("Unsplash");
  const [orientation, setOrientation] = useState("landscape");
  const [images, setImages] = useState(recentImages); // This replaces your "recentImages"
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    }
  }, [provider, orientation]);

  // API Keys (Replace these with your actual keys)
  const API_KEYS = {
    unsplash: import.meta.env.VITE_UNSPLASH_KEY,
    pexels: import.meta.env.VITE_PEXELS_KEY,
    pixabay: import.meta.env.VITE_PIXABAY_KEY,
  };

  const PROVIDERS = {
    Unsplash: {
      buildUrl: (query, orientation, keys) =>
        `https://api.unsplash.com/search/photos?query=${query}&orientation=${orientation}&client_id=${keys.unsplash}`,

      headers: () => ({}),

      normalize: (data) =>
        data.results.map((img) => ({
          id: img.id,
          url: img.urls.small,
          name: img.user.name,
          source: "UNSPLASH",
          size: "HD",
        })),
    },

    Pexels: {
      buildUrl: (query, orientation) =>
        `https://api.pexels.com/v1/search?query=${query}&orientation=${orientation}`,

      headers: (keys) => ({
        Authorization: keys.pexels,
      }),

      normalize: (data) =>
        data.photos.map((img) => ({
          id: img.id,
          url: img.src.medium,
          name: img.photographer,
          source: "PEXELS",
          size: "HD",
        })),
    },

    Pixabay: {
      buildUrl: (query, orientation, keys) => {
        const pixOrient =
          orientation === "landscape"
            ? "horizontal"
            : orientation === "portrait"
              ? "vertical"
              : "all";

        return `https://pixabay.com/api/?key=${keys.pixabay}&q=${encodeURIComponent(query)}&orientation=${pixOrient}`;
      },

      headers: () => ({}),

      normalize: (data) =>
        data.hits.map((img) => ({
          id: img.id,
          url: img.webformatURL,
          name: img.user,
          source: "PIXABAY",
          size: "HD",
        })),
    },
  };

  // 2. Search Logic
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);

    try {
      const providerConfig = PROVIDERS[provider];

      const url = providerConfig.buildUrl(searchQuery, orientation, API_KEYS);

      const headers = providerConfig.headers(API_KEYS);

      const response = await fetch(url, { headers });
      const data = await response.json();

      const results = providerConfig.normalize(data);

      setImages(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log(selectedImage);

  // Trigger search on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const insertIntoFrame = async () => {
    if (!selectedImage?.url) return;

    try {
      window.parent.postMessage(
        {
          type: "insert-image",
          imageUrl: selectedImage.url, // Send URL first (faster)
          imageData: null, // Fallback
        },
        "*",
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#1c1c21] text-gray-300 font-sans flex flex-col overflow-hidden">
      {/* 1. COMPACT HEADER */}

      <div className="px-4 py-2 space-y-3">
        {/* 2. SEARCH BAR */}

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />

          <input
            type="text"
            placeholder="Search for images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-11 pr-4 py-3 bg-[#252529] rounded-xl text-white border-none focus:ring-1 focus:ring-[#14b8a6] outline-none placeholder-gray-500 text-sm"
          />
        </div>

        {/* 3. FILTERS - Smaller buttons */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-[#252529] rounded-lg text-xs font-semibold text-white border border-gray-800 outline-none cursor-pointer"
            >
              <option value="Unsplash">Unsplash</option>
              <option value="Pexels">Pexels</option>
              <option value="Pixabay">Pixabay</option>
            </select>
            <ChevronDown
              size={12}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="flex-1 relative">
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value.toLowerCase())}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-[#252529] rounded-lg text-xs font-semibold text-white border border-gray-800 outline-none cursor-pointer"
            >
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
              <option value="square">Square</option>
            </select>
            <ChevronDown
              size={12}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <button className="flex-1 px-3 py-2 bg-[#252529] rounded-lg text-xs font-semibold text-gray-500 border border-gray-800 text-left">
            Keyword
          </button>
        </div>

        {/* 4. ACTION BAR - High visibility buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSearch}
            className="flex-1 bg-[#14b8a6] text-[#1c1c21] py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-[#0d9488] transition-colors"
          >
            Search
          </button>

          <span className="text-[10px] text-gray-400 font-bold px-1">
            Recent
          </span>

          <button className="flex-1 flex items-center justify-center gap-1.5 bg-[#14b8a6] text-[#1c1c21] py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-[#0d9488] transition-colors">
            <Download size={14} /> Insert
          </button>

          <button className="p-2 bg-[#252529] rounded-lg text-gray-300 border border-gray-800 hover:text-white">
            <Bookmark size={16} />
          </button>
        </div>
      </div>

      {/* 5. IMAGE GRID */}
      <main className="flex-1 px-4 overflow-y-auto mt-2 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3 pb-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative bg-[#252529] rounded-2xl overflow-hidden flex flex-col h-56 border border-gray-800/50"
            >
              <div
                className={`flex-1 relative cursor-pointer ${
                  selectedImage?.id === image.id ? "ring-2 ring-[#14b8a6]" : ""
                }`}
                onClick={() => setSelectedImage(image)}
              >
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full ${image.color}`} />
                )}
                <Bookmark
                  size={16}
                  className="absolute top-3 right-3 text-gray-400 opacity-60 hover:text-white cursor-pointer"
                />
              </div>

              <div className="p-3 space-y-2">
                <div className="text-sm font-bold text-white truncate">
                  {image.name}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="text-[8px] bg-[#1c1c21] text-[#14b8a6] px-1.5 py-0.5 rounded font-black">
                      {image.source}
                    </span>
                    <span className="text-[8px] bg-[#1c1c21] text-gray-500 px-1.5 py-0.5 rounded font-black">
                      {image.size}
                    </span>
                  </div>
                  <Bookmark size={14} className="text-gray-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 6. SMALLER FOOTER */}
      <footer className="p-3 flex gap-2 border-t border-gray-800/20 bg-[#1c1c21]">
        <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-[#252529] rounded-xl text-gray-500 hover:text-white transition-colors">
          <ImageIcon size={16} />
          <span className="text-[9px] font-bold">As background</span>
        </button>
        <button
          onClick={insertIntoFrame}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-[#252529] rounded-xl text-[#14b8a6] border border-[#14b8a6]/30"
        >
          <Hash size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-bold">Into frame</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-[#252529] rounded-xl text-gray-500 hover:text-white transition-colors">
          <Maximize size={16} />
          <span className="text-[9px] font-bold">Auto-resize</span>
        </button>
      </footer>
    </div>
  );
}

export default App;
