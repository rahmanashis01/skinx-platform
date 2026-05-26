import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const DiseaseDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const diseasesData = {
    "acne-and-rosacea": {
      name: "Acne and Rosacea",
      description:
        "Acne and rosacea are common inflammatory skin conditions that affect the face, causing redness, bumps, and sometimes pus-filled lesions.",
      howItLooks: [
        "Texture: Red bumps, pustules, or cysts on the face",
        "Color: Redness, particularly on cheeks, nose, and forehead",
        "Shape: Papules, pustules, or nodules of varying sizes",
        "Location: Primarily affects the face, especially the T-zone for acne and central face for rosacea",
        "Rosacea may show visible blood vessels and persistent facial redness",
      ],
      whyAppears: [
        "Hormonal changes (especially in acne)",
        "Overactive sebaceous glands",
        "Bacterial colonization (Propionibacterium acnes)",
        "Genetic predisposition",
        "Environmental triggers (sun, spicy foods, alcohol for rosacea)",
      ],
      concern:
        "While generally not dangerous, severe acne can cause scarring and affect self-esteem. Rosacea can progressively worsen if untreated. Consult a dermatologist for persistent or severe cases, especially if over-the-counter treatments don't help.",
    },
    "actinic-keratosis": {
      name: "Actinic Keratosis",
      description:
        "Actinic keratosis (AK) is a precancerous skin condition caused by long-term sun exposure, appearing as rough, scaly patches on sun-exposed areas.",
      howItLooks: [
        "Texture: Rough, dry, scaly patches that feel like sandpaper",
        "Color: Pink, red, brown, or skin-colored",
        "Shape: Flat or slightly raised patches",
        "Size: Usually small (less than 1 inch in diameter)",
        "Location: Sun-exposed areas like face, ears, scalp, neck, forearms, and backs of hands",
      ],
      whyAppears: [
        "Cumulative UV radiation damage over years",
        "Fair skin with less melanin protection",
        "Advanced age (more common after 40)",
        "History of sunburns",
        "Weakened immune system",
      ],
      concern:
        "Yes, you should be concerned. While AK itself is benign, it can develop into squamous cell carcinoma (a type of skin cancer) in about 5-10% of cases. Early treatment is recommended. See a dermatologist for proper evaluation and treatment options.",
    },
    "atopic-dermatitis": {
      name: "Atopic Dermatitis",
      description:
        "Atopic dermatitis (eczema) is a chronic inflammatory skin condition characterized by itchy, red, and dry patches of skin, often beginning in childhood.",
      howItLooks: [
        "Texture: Dry, scaly, and sometimes thickened skin (lichenification)",
        "Color: Red or brownish patches",
        "Shape: Irregular patches that may ooze or crust when scratched",
        "Location: Face, hands, feet, inner elbows, and behind knees",
        "Often accompanied by intense itching",
      ],
      whyAppears: [
        "Genetic predisposition (family history of eczema, asthma, or allergies)",
        "Immune system dysfunction",
        "Skin barrier defects allowing moisture loss",
        "Environmental triggers (allergens, irritants, stress)",
        "Climate factors (dry, cold weather)",
      ],
      concern:
        "While not life-threatening, atopic dermatitis can significantly impact quality of life due to itching and discomfort. Scratching can lead to infections. Consult a dermatologist for proper management, especially if symptoms are severe or interfering with daily activities.",
    },
    "bullous-disease": {
      name: "Bullous Disease",
      description:
        "Bullous diseases are a group of autoimmune conditions characterized by the formation of blisters (bullae) on the skin and sometimes mucous membranes.",
      howItLooks: [
        "Texture: Large, fluid-filled blisters on skin",
        "Color: Clear or slightly cloudy fluid inside blisters",
        "Shape: Round or oval blisters of varying sizes",
        "Location: Can appear anywhere on the body",
        "Blisters may rupture, leaving raw, painful areas",
      ],
      whyAppears: [
        "Autoimmune response attacking proteins that hold skin layers together",
        "Genetic factors may play a role",
        "Certain medications can trigger some forms",
        "Age (some types more common in elderly)",
        "Other autoimmune conditions may be present",
      ],
      concern:
        "Yes, bullous diseases require medical attention. They can be serious and may lead to infections, fluid loss, and other complications. Some forms can be life-threatening if untreated. Immediate dermatological consultation is recommended.",
    },
    "cellulitis-impetigo": {
      name: "Cellulitis Impetigo",
      description:
        "Cellulitis and impetigo are bacterial skin infections. Cellulitis affects deeper skin layers, while impetigo is a superficial infection common in children.",
      howItLooks: [
        "Cellulitis: Red, swollen, warm, and tender skin",
        "Impetigo: Honey-colored crusty sores or blisters",
        "Color: Red (cellulitis) or yellowish crusts (impetigo)",
        "Location: Cellulitis often on legs; impetigo around nose and mouth",
        "May be accompanied by fever and swollen lymph nodes",
      ],
      whyAppears: [
        "Bacterial infection (usually Streptococcus or Staphylococcus)",
        "Breaks in the skin (cuts, insect bites, wounds)",
        "Weakened immune system",
        "Poor hygiene (especially for impetigo)",
        "Close contact with infected individuals",
      ],
      concern:
        "Yes, these infections require prompt medical treatment. Cellulitis can spread rapidly and lead to serious complications if untreated. Impetigo is highly contagious. Both typically require antibiotic treatment. Seek medical care promptly.",
    },
    eczema: {
      name: "Eczema",
      description:
        "Eczema (atopic dermatitis) is a chronic inflammatory skin condition causing dry, itchy, and inflamed patches of skin.",
      howItLooks: [
        "Texture: Dry, rough, scaly patches",
        "Color: Red, pink, or brownish",
        "Shape: Irregular patches that may thicken over time",
        "Location: Face, hands, elbows, knees, ankles",
        "Intense itching is a hallmark symptom",
      ],
      whyAppears: [
        "Genetic predisposition",
        "Immune system overreaction",
        "Skin barrier dysfunction",
        "Environmental allergens and irritants",
        "Stress and hormonal changes",
      ],
      concern:
        "While not dangerous, eczema can be very uncomfortable and affect quality of life. Scratching can lead to skin infections. See a dermatologist if symptoms are severe, widespread, or not responding to over-the-counter treatments.",
    },
    "exanthems-drug-eruptions": {
      name: "Exanthems and Drug Eruptions",
      description:
        "Exanthems are widespread rashes, often viral in origin. Drug eruptions are adverse skin reactions to medications.",
      howItLooks: [
        "Texture: Varies from flat to raised bumps",
        "Color: Red or pink rash",
        "Shape: May be measles-like, hive-like, or other patterns",
        "Location: Often starts on trunk and spreads",
        "May be accompanied by fever or itching",
      ],
      whyAppears: [
        "Viral infections (measles, chickenpox, etc.)",
        "Allergic reaction to medications",
        "Immune system response",
        "Common culprit drugs: antibiotics, NSAIDs, anticonvulsants",
        "Usually appears within days to weeks of starting medication",
      ],
      concern:
        "Most viral exanthems are self-limiting, but some can be serious. Drug eruptions can range from mild to life-threatening (e.g., Stevens-Johnson syndrome). Seek immediate medical attention if you develop a rash after starting a new medication, especially if accompanied by fever, blistering, or difficulty breathing.",
    },
    "hair-loss-alopecia": {
      name: "Hair Loss (Alopecia)",
      description:
        "Alopecia is hair loss that can be temporary or permanent, occurring in various patterns and caused by different factors.",
      howItLooks: [
        "Texture: Bald patches with smooth skin or thinning hair",
        "Color: Skin in bald areas typically matches surrounding skin",
        "Shape: Can be round patches (alopecia areata) or diffuse thinning",
        "Location: Scalp primarily, but can affect beard, eyebrows, body",
        "May show 'exclamation point' hairs at edges of patches",
      ],
      whyAppears: [
        "Autoimmune response (alopecia areata)",
        "Hereditary factors (androgenetic alopecia)",
        "Hormonal changes",
        "Medical conditions (thyroid disorders, anemia)",
        "Stress, medications, or nutritional deficiencies",
      ],
      concern:
        "While often not medically serious, hair loss can significantly impact emotional well-being. Sudden or rapid hair loss, especially with other symptoms, warrants medical evaluation to rule out underlying conditions. A dermatologist can help determine the cause and discuss treatment options.",
    },
    "herpes-hpv": {
      name: "Herpes HPV",
      description:
        "Herpes and HPV are viral infections. Herpes causes painful blisters, while HPV can cause warts or remain asymptomatic.",
      howItLooks: [
        "Herpes: Clusters of small, painful blisters on red base",
        "HPV: Warts of varying sizes and textures",
        "Color: Blisters start clear, may become yellowish; warts are flesh-colored",
        "Location: Herpes - mouth or genital area; HPV - anywhere on skin",
        "Herpes may be preceded by tingling or burning sensation",
      ],
      whyAppears: [
        "Viral infection (HSV for herpes, HPV for warts)",
        "Direct skin-to-skin contact with infected person",
        "Sexual transmission (for genital forms)",
        "Weakened immune system allows virus to activate",
        "Both viruses remain in body permanently",
      ],
      concern:
        "Yes, medical attention is recommended. While herpes outbreaks can be managed, the virus is incurable and contagious. Some HPV strains are associated with cancer risk. Consult a healthcare provider for proper diagnosis and treatment, especially for genital lesions.",
    },
    "light-diseases": {
      name: "Light Diseases",
      description:
        "Light-related skin diseases are conditions triggered or worsened by sun exposure, including photodermatoses and sun allergies.",
      howItLooks: [
        "Texture: Varies from flat rash to raised bumps or blisters",
        "Color: Red, pink, or appears as darkened patches",
        "Shape: Depends on specific condition",
        "Location: Sun-exposed areas (face, neck, arms, hands)",
        "May include itching, burning, or stinging sensations",
      ],
      whyAppears: [
        "Abnormal reaction to UV radiation",
        "Photosensitizing medications or substances",
        "Immune system response to sun exposure",
        "Genetic predisposition",
        "Underlying autoimmune conditions",
      ],
      concern:
        "Severity varies by condition. Some are merely annoying, while others can be chronic and significantly limit outdoor activities. If you develop persistent rashes after sun exposure, consult a dermatologist. Sun protection is crucial for all light-sensitive conditions.",
    },
    lupus: {
      name: "Lupus",
      description:
        "Lupus is a chronic autoimmune disease that can affect skin and other organs, with cutaneous manifestations including the characteristic 'butterfly rash.'",
      howItLooks: [
        "Texture: Flat or slightly raised rash",
        "Color: Red or purple",
        "Shape: Butterfly-shaped rash across cheeks and nose (malar rash)",
        "Location: Face, scalp, hands, or other sun-exposed areas",
        "May include disc-shaped lesions (discoid lupus)",
      ],
      whyAppears: [
        "Autoimmune disorder attacking healthy tissue",
        "Genetic factors",
        "Environmental triggers (sunlight, infections, medications)",
        "Hormonal factors (more common in women)",
        "Unknown exact cause",
      ],
      concern:
        "Yes, lupus requires medical attention. It's a serious systemic disease that can affect multiple organs. Early diagnosis and treatment are important to prevent complications. See a rheumatologist or dermatologist if you suspect lupus, especially if skin symptoms are accompanied by joint pain, fatigue, or fever.",
    },
    "melanoma-skin-cancer": {
      name: "Melanoma Skin Cancer",
      description:
        "Melanoma is the most dangerous type of skin cancer, developing from pigment-producing cells (melanocytes) and capable of spreading to other organs.",
      howItLooks: [
        "Texture: Usually flat initially, may become raised",
        "Color: Brown, black, or multicolored (tan, red, white, blue)",
        "Shape: Asymmetric with irregular borders",
        "Size: Often larger than 6mm, but can be smaller",
        "May change in size, shape, or color over time",
      ],
      whyAppears: [
        "UV radiation damage to melanocyte DNA",
        "History of severe sunburns, especially in childhood",
        "Fair skin with less protective melanin",
        "Genetic predisposition",
        "Many moles or atypical moles",
      ],
      concern:
        "YES - URGENT. Melanoma is life-threatening if not caught early but highly treatable in early stages. Any new, changing, or unusual mole requires immediate dermatological evaluation. Use the ABCDE rule: Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolution (changing).",
    },
    "nail-fungus": {
      name: "Nail Fungus",
      description:
        "Nail fungus (onychomycosis) is a fungal infection of the nail that causes discoloration, thickening, and sometimes nail separation.",
      howItLooks: [
        "Texture: Thickened, brittle, or crumbly nails",
        "Color: Yellow, white, brown, or black discoloration",
        "Shape: Distorted nail shape",
        "Location: Toenails more commonly affected than fingernails",
        "Nail may separate from nail bed or emit slight odor",
      ],
      whyAppears: [
        "Fungal infection (dermatophytes most common)",
        "Warm, moist environments (sweaty shoes)",
        "Nail trauma or injury",
        "Weakened immune system",
        "Age (more common in older adults)",
      ],
      concern:
        "While not immediately dangerous, nail fungus is stubborn and can spread to other nails. It may cause discomfort and increase infection risk in diabetics or those with compromised immunity. Over-the-counter treatments rarely work; prescription medications are usually needed.",
    },
    "poison-ivy": {
      name: "Poison Ivy",
      description:
        "Poison ivy dermatitis is an allergic reaction to urushiol oil found in poison ivy, oak, and sumac plants, causing an itchy, blistering rash.",
      howItLooks: [
        "Texture: Red, swollen skin with streaky lines or patches",
        "Color: Red initially, may develop fluid-filled blisters",
        "Shape: Linear streaks where plant brushed skin",
        "Location: Any exposed skin that contacted the plant",
        "Intense itching is characteristic",
      ],
      whyAppears: [
        "Allergic reaction to urushiol oil in plant sap",
        "Direct contact with plant",
        "Indirect contact (touching contaminated clothing, pets, tools)",
        "Smoke from burning plants can spread oil",
        "Reaction typically appears 12-72 hours after exposure",
      ],
      concern:
        "Usually not serious but very uncomfortable. Most cases resolve in 2-3 weeks. Seek medical care if rash is widespread, on face or genitals, shows signs of infection, or you have difficulty breathing (rare but serious reaction). Prevent by learning to identify and avoid these plants.",
    },
    psoriasis: {
      name: "Psoriasis",
      description:
        "Psoriasis is a chronic autoimmune condition causing rapid skin cell buildup, resulting in thick, scaly patches that may be itchy or painful.",
      howItLooks: [
        "Texture: Thick, raised patches covered with silvery-white scales",
        "Color: Red or pink base with white or silver scales",
        "Shape: Well-defined plaques of various sizes",
        "Location: Elbows, knees, scalp, lower back, but can appear anywhere",
        "May crack and bleed; often itchy or painful",
      ],
      whyAppears: [
        "Autoimmune disorder causing rapid skin cell turnover",
        "Genetic predisposition (family history)",
        "Triggered by stress, infections, medications, or injuries",
        "Cold, dry weather often worsens symptoms",
        "Smoking and alcohol may be risk factors",
      ],
      concern:
        "While not contagious or life-threatening, psoriasis is a chronic condition that can significantly impact quality of life. It's associated with increased risk of psoriatic arthritis and cardiovascular disease. Dermatological care can help manage symptoms. Various effective treatments are available.",
    },
    "scabies-lyme-disease": {
      name: "Scabies Lyme Disease",
      description:
        "Scabies is caused by mites burrowing in skin; Lyme disease is a tick-borne illness. Both can cause characteristic skin manifestations.",
      howItLooks: [
        "Scabies: Intense itching, burrow tracks, small red bumps",
        "Lyme: Bull's-eye rash (erythema migrans) at tick bite site",
        "Scabies worse at night; Lyme rash expands over days",
        "Scabies: between fingers, wrists, elbows; Lyme: anywhere",
        "Both may have systemic symptoms (fever, fatigue)",
      ],
      whyAppears: [
        "Scabies: Sarcoptes scabiei mite infestation",
        "Lyme: Borrelia burgdorferi bacteria from tick bite",
        "Scabies spreads through close contact",
        "Lyme from infected deer tick bite",
        "Both can be difficult to diagnose initially",
      ],
      concern:
        "Both require medical treatment. Scabies won't resolve without prescription treatment and is highly contagious. Lyme disease can cause serious complications if untreated (joint, heart, neurological problems). Early treatment with antibiotics is crucial for Lyme. See a doctor promptly if suspected.",
    },
    "seborrheic-keratoses": {
      name: "Seborrheic Keratoses",
      description:
        "Seborrheic keratoses are benign, wart-like growths that commonly appear with age, having a 'stuck-on' appearance.",
      howItLooks: [
        "Texture: Raised, wart-like with 'stuck-on' appearance",
        "Color: Tan, brown, or black (varying shades)",
        "Shape: Round or oval with well-defined borders",
        "Size: Ranges from very small to over an inch",
        "Surface may appear waxy, scaly, or slightly greasy",
      ],
      whyAppears: [
        "Unknown exact cause, associated with aging",
        "Genetic factors (tend to run in families)",
        "Not caused by sun exposure",
        "Not related to cancer or infection",
        "Extremely common, especially after age 50",
      ],
      concern:
        "No - seborrheic keratoses are harmless and don't require treatment unless irritated or for cosmetic reasons. However, they can sometimes resemble skin cancer. If you have a growth you're unsure about, especially if it changes, have it checked by a dermatologist.",
    },
    "systemic-disease": {
      name: "Systemic Disease",
      description:
        "Various systemic diseases can manifest with skin symptoms, including diabetes, liver disease, kidney disease, and autoimmune conditions.",
      howItLooks: [
        "Varies widely depending on underlying disease",
        "May include discoloration, rashes, or textural changes",
        "Diabetes: darkening in skin folds, slow-healing wounds",
        "Liver disease: jaundice, spider angiomas, itching",
        "Kidney disease: dry, itchy skin, color changes",
      ],
      whyAppears: [
        "Underlying systemic illness affecting skin",
        "Metabolic or hormonal imbalances",
        "Circulatory problems",
        "Immune system disorders",
        "Medication side effects",
      ],
      concern:
        "Yes - skin manifestations of systemic disease often indicate an underlying condition requiring medical attention. If you develop unexplained skin changes, especially with other symptoms (fatigue, weight changes, pain), consult a healthcare provider for thorough evaluation.",
    },
    "tinea-ringworm-candida": {
      name: "Tinea Ringworm Candida",
      description:
        "These are fungal infections: tinea/ringworm affects skin, nails, or scalp; candida causes yeast infections of skin and mucous membranes.",
      howItLooks: [
        "Ringworm: Ring-shaped rash with clearer center",
        "Candida: Red, raw patches in skin folds",
        "Texture: Scaly edges (ringworm), moist and inflamed (candida)",
        "Color: Red with defined borders",
        "Location: Ringworm - anywhere; Candida - warm, moist areas",
      ],
      whyAppears: [
        "Fungal infection (dermatophytes for ringworm, Candida yeast)",
        "Warm, moist environments promote growth",
        "Direct contact with infected person or animal",
        "Weakened immune system",
        "Antibiotics (can allow Candida overgrowth)",
      ],
      concern:
        "Generally not serious but contagious and won't resolve without treatment. Antifungal medications (topical or oral) are usually effective. See a doctor if over-the-counter treatments don't work within 2 weeks, or if infection is severe or widespread.",
    },
    "urticaria-hives": {
      name: "Urticaria (Hives)",
      description:
        "Urticaria, commonly known as hives, are raised, itchy welts on the skin caused by allergic reactions or other triggers.",
      howItLooks: [
        "Texture: Raised, smooth welts (wheals)",
        "Color: Red or skin-colored with pale centers",
        "Shape: Vary in size and shape; may merge together",
        "Location: Can appear anywhere on body",
        "Individual welts come and go, typically within 24 hours",
      ],
      whyAppears: [
        "Allergic reaction to food, medications, or insect stings",
        "Physical triggers (pressure, temperature, exercise)",
        "Infections or underlying health conditions",
        "Stress",
        "Often no identifiable cause (chronic urticaria)",
      ],
      concern:
        "Most cases are not serious and resolve on their own. However, seek emergency care if hives are accompanied by difficulty breathing, swelling of tongue or throat, dizziness, or other signs of anaphylaxis. Chronic hives (lasting >6 weeks) warrant medical evaluation.",
    },
    "vascular-tumors": {
      name: "Vascular Tumors",
      description:
        "Vascular tumors are growths composed of blood vessels. Most are benign, including hemangiomas (common in infants) and cherry angiomas.",
      howItLooks: [
        "Texture: Raised or flat, may feel soft or firm",
        "Color: Red, purple, or blue",
        "Shape: Varies - dome-shaped, flat, or irregular",
        "Size: From pinpoint to several centimeters",
        "Common types: cherry angiomas (small red dots), hemangiomas (larger)",
      ],
      whyAppears: [
        "Usually unknown cause",
        "Hemangiomas: abnormal blood vessel growth in infancy",
        "Cherry angiomas: associated with aging",
        "Genetic factors may play a role",
        "Most are benign and not related to cancer",
      ],
      concern:
        "Most vascular tumors are harmless. However, infantile hemangiomas near eyes, nose, or mouth may need treatment. Any rapidly growing or changing vascular lesion should be evaluated. While rare, some vascular tumors can be problematic and require medical attention.",
    },
    vasculitis: {
      name: "Vasculitis",
      description:
        "Vasculitis is inflammation of blood vessels that can affect skin and other organs, appearing as purplish spots, nodules, or ulcers.",
      howItLooks: [
        "Texture: Flat purple spots, raised bumps, or open sores",
        "Color: Purple, red, or brown",
        "Shape: Varies from small dots to larger patches or ulcers",
        "Location: Often on legs, but can occur anywhere",
        "May be accompanied by pain, fever, or other symptoms",
      ],
      whyAppears: [
        "Immune system attacking blood vessel walls",
        "Infections or medications may trigger",
        "Autoimmune diseases",
        "Sometimes unknown cause",
        "Can range from mild to life-threatening",
      ],
      concern:
        "Yes - vasculitis requires medical evaluation. While some forms are mild and limited to skin, others can involve internal organs and be serious. Diagnosis often requires blood tests, biopsy, and imaging. Treatment depends on severity and which organs are affected.",
    },
    "warts-molluscum": {
      name: "Warts Molluscum",
      description:
        "Warts (caused by HPV) and molluscum contagiosum (caused by poxvirus) are viral skin infections causing characteristic bumps.",
      howItLooks: [
        "Warts: Rough, grainy bumps",
        "Molluscum: Smooth, dome-shaped with central dimple",
        "Color: Warts are flesh-colored or darker; molluscum is skin-colored or pink",
        "Size: Varies from pinpoint to pea-sized",
        "Location: Warts - hands, feet; Molluscum - anywhere, common in children",
      ],
      whyAppears: [
        "Viral infection (HPV for warts, poxvirus for molluscum)",
        "Direct skin contact or contaminated surfaces",
        "More common in children",
        "Spread by scratching or shaving",
        "Weakened immune system increases susceptibility",
      ],
      concern:
        "Generally not serious and often resolve on their own, especially molluscum. However, they're contagious and can spread. Warts can be painful, especially on feet. Treatment options are available if lesions are bothersome, numerous, or persistent. Genital warts require medical evaluation.",
    },
  };

  const disease = diseasesData[slug];

  if (!disease) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Disease not found
          </h1>
          <button
            onClick={() => navigate("/diseases-dictionary")}
            className="text-blue-600 hover:underline"
          >
            Back to dictionary
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar alwaysOpaque={true} />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-12 pt-24">
        {/* Back Button */}
        <button
          onClick={() => navigate("/diseases-dictionary")}
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
          <span className="font-medium">Back to dictionary</span>
        </button>

        {/* Disease Name */}
        <h1 className="text-4xl font-bold text-[#1e293b] mb-8">
          {disease.name}
        </h1>

        {/* Content */}
        <div className="text-[#475569] leading-relaxed space-y-8">
          {/* Causes, Symptoms, and When to Take Action */}
          <div>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4">
              Causes, Symptoms, and When to Take Action
            </h2>
            <p className="text-base leading-relaxed">{disease.description}</p>
          </div>

          {/* How It Looks */}
          <div>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4">
              How It Looks
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              {disease.howItLooks.map((item, index) => (
                <li key={index} className="text-base leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Why Does It Appear? */}
          <div>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4">
              Why Does It Appear?
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              {disease.whyAppears.map((item, index) => (
                <li key={index} className="text-base leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Should You Be Concerned? */}
          <div>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4">
              Should You Be Concerned?
            </h2>
            <p className="text-base leading-relaxed">{disease.concern}</p>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-700">
              <strong>Disclaimer:</strong> This information is for educational
              purposes only and should not replace professional medical advice.
              Always consult a qualified healthcare provider for diagnosis and
              treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetail;
