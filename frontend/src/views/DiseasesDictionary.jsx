import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const DiseasesDictionary = () => {
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const diseases = [
    { name: "Acne and Rosacea", slug: "acne-and-rosacea", letter: "A" },
    { name: "Actinic Keratosis", slug: "actinic-keratosis", letter: "A" },
    { name: "Atopic Dermatitis", slug: "atopic-dermatitis", letter: "A" },
    { name: "Bullous Disease", slug: "bullous-disease", letter: "B" },
    { name: "Cellulitis Impetigo", slug: "cellulitis-impetigo", letter: "C" },
    { name: "Eczema", slug: "eczema", letter: "E" },
    {
      name: "Exanthems and Drug Eruptions",
      slug: "exanthems-drug-eruptions",
      letter: "E",
    },
    { name: "Hair Loss (Alopecia)", slug: "hair-loss-alopecia", letter: "H" },
    { name: "Herpes HPV", slug: "herpes-hpv", letter: "H" },
    { name: "Light Diseases", slug: "light-diseases", letter: "L" },
    { name: "Lupus", slug: "lupus", letter: "L" },
    { name: "Melanoma Skin Cancer", slug: "melanoma-skin-cancer", letter: "M" },
    { name: "Nail Fungus", slug: "nail-fungus", letter: "N" },
    { name: "Poison Ivy", slug: "poison-ivy", letter: "P" },
    { name: "Psoriasis", slug: "psoriasis", letter: "P" },
    { name: "Scabies Lyme Disease", slug: "scabies-lyme-disease", letter: "S" },
    { name: "Seborrheic Keratoses", slug: "seborrheic-keratoses", letter: "S" },
    { name: "Systemic Disease", slug: "systemic-disease", letter: "S" },
    {
      name: "Tinea Ringworm Candida",
      slug: "tinea-ringworm-candida",
      letter: "T",
    },
    { name: "Urticaria Hives", slug: "urticaria-hives", letter: "U" },
    { name: "Vascular Tumors", slug: "vascular-tumors", letter: "V" },
    { name: "Vasculitis", slug: "vasculitis", letter: "V" },
    { name: "Warts Molluscum", slug: "warts-molluscum", letter: "W" },
  ];

  const letters = [
    "All",
    "A",
    "B",
    "C",
    "E",
    "H",
    "L",
    "M",
    "N",
    "P",
    "S",
    "T",
    "U",
    "V",
    "W",
  ];

  const filteredDiseases = diseases.filter((disease) => {
    const matchesLetter =
      selectedLetter === "All" || disease.letter === selectedLetter;
    const matchesSearch = disease.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesLetter && matchesSearch;
  });

  const groupedDiseases = filteredDiseases.reduce((acc, disease) => {
    if (!acc[disease.letter]) {
      acc[disease.letter] = [];
    }
    acc[disease.letter].push(disease);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar alwaysOpaque={true} />

      {/* Main Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[#364a6b] hover:text-[#2a3a54] mb-8 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          {/* Header */}
          <h1 className="text-4xl font-bold text-[#1e293b] mb-8">
            Diseases Dictionary
          </h1>

          {/* Search Box */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search diseases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Alphabetical Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {letters.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedLetter === letter
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Diseases List */}
          <div className="space-y-8">
            {Object.keys(groupedDiseases)
              .sort()
              .map((letter) => (
                <div key={letter}>
                  <h2 className="text-3xl font-bold text-[#1e293b] mb-4">
                    {letter}
                  </h2>
                  <div className="space-y-2">
                    {groupedDiseases[letter].map((disease) => (
                      <button
                        key={disease.slug}
                        onClick={() => navigate(`/diseases/${disease.slug}`)}
                        className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                      >
                        <span className="text-[#475569] font-medium group-hover:text-blue-600">
                          {disease.name}
                        </span>
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {filteredDiseases.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No diseases found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseasesDictionary;
