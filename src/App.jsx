import { useState, useEffect } from "react";

import {
  Search,
  ChevronDown,
  Bookmark,
  Image as ImageIcon,
  Maximize,
  Hash,
  Loader2,
  ArrowLeft,
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
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    }
  }, [provider, orientation, page]);

  useEffect(() => {
    const saved = localStorage.getItem("bookmarkedImages");
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, []);

  const toggleBookmark = (image) => {
    let updated;

    const exists = bookmarks.find((img) => img.id === image.id);

    if (exists) {
      updated = bookmarks.filter((img) => img.id !== image.id);
    } else {
      updated = [...bookmarks, image];
    }

    setBookmarks(updated);
    localStorage.setItem("bookmarkedImages", JSON.stringify(updated));
  };

  const imageNo = import.meta.env.VITE_IMAGE_PER_REQ;
  // API Keys (Replace these with your actual keys)
  const API_KEYS = {
    unsplash: import.meta.env.VITE_UNSPLASH_KEY,
    pexels: import.meta.env.VITE_PEXELS_KEY,
    pixabay: import.meta.env.VITE_PIXABAY_KEY,
  };

  const PROVIDERS = {
    Unsplash: {
      buildUrl: (query, orientation, keys, page) =>
        `https://api.unsplash.com/search/photos?query=${query}&orientation=${orientation}&per_page=${imageNo}&page=${page}&client_id=${keys.unsplash}`,

      headers: () => ({}),

      normalize: (data) =>
        data.results.map((img) => ({
          id: img.id,
          url: img.urls.small,
          name: img.user.name,
          source: "UNSPLASH",
          size: "HD",
          width: img.width,
          height: img.height,
        })),
    },

    Pexels: {
      buildUrl: (query, orientation, page) =>
        `https://api.pexels.com/v1/search?query=${query}&orientation=${orientation}&per_page=${imageNo}&page=${page}`,

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
          width: img.width,
          height: img.height,
        })),
    },

    Pixabay: {
      buildUrl: (query, orientation, keys, page) => {
        const pixOrient =
          orientation === "landscape"
            ? "horizontal"
            : orientation === "portrait"
              ? "vertical"
              : "all";

        return `https://pixabay.com/api/?key=${keys.pixabay}&q=${encodeURIComponent(query)}&orientation=${pixOrient}&per_page=${imageNo}&page=${page}`;
      },

      headers: () => ({}),

      normalize: (data) =>
        data.hits.map((img) => ({
          id: img.id,
          url: img.webformatURL,
          name: img.user,
          source: "PIXABAY",
          size: "HD",
          width: img.imageWidth,
          height: img.imageHeight,
        })),
    },
  };

  // 2. Search Logic
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);

    try {
      const providerConfig = PROVIDERS[provider];

      const url = providerConfig.buildUrl(
        searchQuery,
        orientation,
        API_KEYS,
        page,
      );

      const headers = providerConfig.headers(API_KEYS);

      const response = await fetch(url, { headers });
      const data = await response.json();

      const results = providerConfig.normalize(data);

      setImages((prev) => (page === 1 ? results : [...prev, ...results]));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log(images);

  // Trigger search on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setPage(1);
      handleSearch();
    }
  };

  const insertIntoFrame = async () => {
    if (!selectedImage?.url) return;

    try {
      window.parent.postMessage(
        {
          type: "insert-image",
          photographer: selectedImage.name,
          imageUrl: selectedImage.url,
          imageData: null,
          width: selectedImage.width,
          height: selectedImage.height,
        },
        "*",
      );
    } catch (error) {
      console.error(error);
    }
  };

  const setAsBackground = () => {
    if (!selectedImage?.url) return;

    window.parent.postMessage(
      {
        type: "set-background",
        imageUrl: selectedImage.url,
        width: selectedImage.width,
        height: selectedImage.height,
      },
      "*",
    );
  };

  return (
    <div className="w-screen h-screen bg-[#0f0f12] text-slate-300 font-sans flex flex-col overflow-hidden selection:bg-teal-500/30">
      {/* HEADER SECTION */}
      <header className="px-4 py-2 space-y-3 border-b border-white/5 bg-[#0f0f12]/80 backdrop-blur-xl z-20">
        <div className="relative group">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${loading ? "text-teal-500 animate-pulse" : "text-slate-500 group-focus-within:text-teal-500"}`}
            size={18}
          />
          <input
            type="text"
            placeholder="Search high-quality images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-4 py-3.5 bg-white/5 rounded-2xl text-white border border-white/10 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 outline-none placeholder-slate-500 text-sm transition-all"
          />
          {loading && (
            <Loader2
              className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-teal-500"
              size={16}
            />
          )}
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative group">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full text-xs appearance-none pl-3 pr-8 py-2 bg-[#252529] rounded-lg font-semibold text-white border border-gray-800 outline-none cursor-pointer"
            >
              <option value="Unsplash">Unsplash</option>
              <option value="Pexels">Pexels</option>
              <option value="Pixabay">Pixabay</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
          </div>

          <div className="flex-1 relative">
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value.toLowerCase())}
              className="w-full  text-xs  appearance-none pl-3 pr-8 py-2 bg-[#252529] rounded-lg font-semibold text-white border border-gray-800 outline-none cursor-pointer"
            >
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
              <option value="square">Square</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
          </div>

          <button className="px-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:text-white transition-all">
            Insert
          </button>

          {showBookmarks ? (
            <button
              onClick={() => setShowBookmarks(false)}
              className="px-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:text-white transition-all"
            >
              <ArrowLeft size={16} />
            </button>
          ) : (
            <button
              onClick={() => setShowBookmarks(true)}
              className="px-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:text-white transition-all"
            >
              <Bookmark size={16} />
            </button>
          )}
        </div>
      </header>

      {/* MAIN GRID AREA */}
      <main className="flex-1 px-5 overflow-y-auto custom-scrollbar bg-[#0f0f12]">
        <div className="grid grid-cols-2 gap-4 py-4">
          {(showBookmarks ? bookmarks : images).map((image) => (
            <div
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className={`group relative bg-white/5 rounded-2xl overflow-hidden flex flex-col h-56 cursor-pointer transition-all duration-300 border ${
                selectedImage?.id === image.id ? "ring-2 ring-[#14b8a6]" : ""
              }`}
            >
              {/* Image Container */}
              <div className="flex-1 relative overflow-hidden">
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className={`w-full h-full ${image.color}`} />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(image);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-teal-500 hover:border-teal-500"
                >
                  <Bookmark
                    size={14}
                    fill={
                      bookmarks.some((b) => b.id === image.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              </div>

              {/* Metadata */}
              <div className="p-3 bg-[#16161a]">
                <p className="text-[11px] font-semibold text-white truncate mb-2">
                  {image.name}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="text-[9px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-md font-bold border border-teal-500/20">
                      {image.source}
                    </span>
                    <span className="text-[9px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-md font-bold">
                      {image.size}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!showBookmarks && images.length > 0 && (
          <div className="flex justify-center items-center w-full py-8">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center justify-center px-4 py-2 bg-white/5 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: "#14b8a6",
                color: "#1c1c21",
                boxShadow: "0 4px 14px 0 rgba(20, 184, 166, 0.3)",
              }}
            >
              Load More
            </button>
          </div>
        )}
      </main>

      {/* FOOTER ACTIONS */}
      <footer className="p-4 grid grid-cols-3 gap-3 border-t border-white/5 bg-[#0f0f12] shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
        <button
          onClick={setAsBackground}
          className="flex flex-col items-center justify-center gap-1.5 py-3 bg-white/5 rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
        >
          <ImageIcon size={18} strokeWidth={1.5} />
          <span className="text-[12px] font-bold  tracking-tight">
            As Background
          </span>
        </button>

        <button
          onClick={insertIntoFrame}
          className={`flex flex-col items-center justify-center gap-1.5 py-3 bg-white/5 rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95`}
        >
          <Hash size={20} strokeWidth={1.5} />
          <span className="text-[12px] font-bold  tracking-tight">
            Into Frame
          </span>
        </button>

        <button className="flex flex-col items-center justify-center gap-1.5 py-3 bg-white/5 rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95">
          <Maximize size={18} strokeWidth={1.5} />
          <span className="text-[12px] font-bold  tracking-tight">
            Auto-Size
          </span>
        </button>
      </footer>
    </div>
  );
}

export default App;
