import { useState } from "react";
import { ChevronDown } from "lucide-react";
import "./FilterPanel.css";

export default function FilterPanel({ onChange }) {
  const [openSections, setOpenSections] = useState([]);

  const [filters, setFilters] = useState({
    jenis: [],
    genre: "",
    penulis: "",
    tahun: "",
    rating: "",
  });

  const toggleSection = (key) => {
    setOpenSections((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const updateFilters = (nextFilters) => {
    setFilters(nextFilters);
    onChange?.(nextFilters);
  };

  const toggleJenis = (value) => {
    const exists = filters.jenis.includes(value);

    const nextFilters = {
      ...filters,
      jenis: exists
        ? filters.jenis.filter((item) => item !== value)
        : [...filters.jenis, value],
    };

    updateFilters(nextFilters);
  };

  const selectFilter = (key, value) => {
    const nextFilters = {
      ...filters,
      [key]: filters[key] === value ? "" : value,
    };

    updateFilters(nextFilters);
  };

  const resetFilters = () => {
    const reset = {
      jenis: [],
      genre: "",
      penulis: "",
      tahun: "",
      rating: "",
    };

    updateFilters(reset);
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-title">Filter</div>

      <div className="filter-group">
        <button
          type="button"
          className="filter-header"
          onClick={() => toggleSection("jenis")}
        >
          <span>Jenis Buku</span>
          <ChevronDown
            size={18}
            className={`filter-chevron ${
              openSections.includes("jenis") ? "open" : ""
            }`}
          />
        </button>

        {openSections.includes("jenis") && (
          <div className="filter-body">
            {["Pelajaran", "Novel", "Kamus"].map((item) => (
              <button
                key={item}
                type="button"
                className={`filter-pill ${
                  filters.jenis.includes(item) ? "active" : ""
                }`}
                onClick={() => toggleJenis(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <button
          type="button"
          className="filter-header"
          onClick={() => toggleSection("genre")}
        >
          <span>Genre</span>
          <ChevronDown
            size={18}
            className={`filter-chevron ${
              openSections.includes("genre") ? "open" : ""
            }`}
          />
        </button>

        {openSections.includes("genre") && (
          <div className="filter-body">
            {["Fantasi", "Romance", "Horor", "Action", "Komedi"].map((item) => (
              <button
                key={item}
                type="button"
                className={`filter-pill ${
                  filters.genre === item ? "active" : ""
                }`}
                onClick={() => selectFilter("genre", item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <button
          type="button"
          className="filter-header"
          onClick={() => toggleSection("penulis")}
        >
          <span>Penulis</span>
          <ChevronDown
            size={18}
            className={`filter-chevron ${
              openSections.includes("penulis") ? "open" : ""
            }`}
          />
        </button>

        {openSections.includes("penulis") && (
          <div className="filter-body">
            {["Tere Liye", "Andrea Hirata", "Dewi Lestari"].map((item) => (
              <button
                key={item}
                type="button"
                className={`filter-pill ${
                  filters.penulis === item ? "active" : ""
                }`}
                onClick={() => selectFilter("penulis", item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <button
          type="button"
          className="filter-header"
          onClick={() => toggleSection("tahun")}
        >
          <span>Tahun Terbit</span>
          <ChevronDown
            size={18}
            className={`filter-chevron ${
              openSections.includes("tahun") ? "open" : ""
            }`}
          />
        </button>

        {openSections.includes("tahun") && (
          <div className="filter-body">
            {["2024", "2023", "2022", "2021"].map((item) => (
              <button
                key={item}
                type="button"
                className={`filter-pill ${
                  filters.tahun === item ? "active" : ""
                }`}
                onClick={() => selectFilter("tahun", item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="button" className="filter-reset" onClick={resetFilters}>
        Reset Filter
      </button>
    </div>
  );
}