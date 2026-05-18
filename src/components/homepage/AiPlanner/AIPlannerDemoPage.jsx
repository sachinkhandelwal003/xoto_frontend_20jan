import { useState } from "react";

/**
 * Dummy JSON representing full customer workflow
 * (Later this will come from backend API)
 */
const projectData = {
  location: {
    address: "Villa 24, Whitefield, Bangalore",
    lat: 12.9698,
    lng: 77.75,
  },
  service: "Landscaping",
  preview: {
    shown: true,
    image:
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
  },
  moodBoard: {
    style: "Modern Tropical",
    images: [
      "https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    ],
  },
  package: {
    type: "Premium",
    price: 4999,
  },
  unlock: true,
};

function AIPlannerDemoPage() {
  const [step, setStep] = useState(1);

  return (
    <div style={{ maxWidth: "1100px", margin: "auto", padding: "24px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>
        AI Planner – Customer Workflow Demo
      </h1>

      {/* STEP 1: LOCATION */}
      {step >= 1 && (
        <section style={boxStyle}>
          <h2>1. Location Selected</h2>
          <p>📍 {projectData.location.address}</p>
          <button onClick={() => setStep(2)} style={buttonStyle}>
            Continue
          </button>
        </section>
      )}

      {/* STEP 2: SERVICE */}
      {step >= 2 && (
        <section style={boxStyle}>
          <h2>2. Service Selected</h2>
          <p>Service: {projectData.service}</p>
          <button onClick={() => setStep(3)} style={buttonStyle}>
            Show Preview
          </button>
        </section>
      )}

      {/* STEP 3: QUICK VISUAL PREVIEW */}
      {step >= 3 && (
        <section style={boxStyle}>
          <h2>3. Quick Visual Preview</h2>
          <img
            src={projectData.preview.image}
            alt="Quick Preview"
            style={{
              width: "100%",
              maxHeight: "350px",
              objectFit: "cover",
              borderRadius: "12px",
              opacity: 0.85,
            }}
          />
          <button onClick={() => setStep(4)} style={buttonStyle}>
            Generate Mood Board
          </button>
        </section>
      )}

      {/* STEP 4: MOOD BOARD */}
      {step >= 4 && (
        <section style={boxStyle}>
          <h2>4. Mood Board</h2>
          <p>Style: {projectData.moodBoard.style}</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {projectData.moodBoard.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="Mood"
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
              />
            ))}
          </div>

          <button onClick={() => setStep(5)} style={buttonStyle}>
            Choose Package
          </button>
        </section>
      )}

      {/* STEP 5: PACKAGE */}
      {step >= 5 && (
        <section style={boxStyle}>
          <h2>5. Package Selected</h2>
          <p>
            Package: <strong>{projectData.package.type}</strong>
          </p>
          <p>Price: ₹{projectData.package.price}</p>

          <button onClick={() => setStep(6)} style={buttonStyle}>
            Unlock Content
          </button>
        </section>
      )}

      {/* STEP 6: UNLOCK */}
      {step >= 6 && projectData.unlock && (
        <section style={{ ...boxStyle, background: "#e8fff1" }}>
          <h2>6. Content Unlocked 🎉</h2>
          <p>BOQ, Pricing Sheet & Design files are now available.</p>

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button style={successButton}>Download BOQ</button>
            <button style={successButton}>Download Cost Sheet</button>
          </div>
        </section>
      )}

      {/* RAW JSON */}
      <section style={{ ...boxStyle, background: "#f5f5f5" }}>
        <h2>Raw Project JSON (Demo)</h2>
        <pre
          style={{
            fontSize: "13px",
            overflowX: "auto",
            marginTop: "12px",
          }}
        >
          {JSON.stringify(projectData, null, 2)}
        </pre>
      </section>
    </div>
  );
}

/* Simple inline styles (no CSS dependency) */
const boxStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "24px",
};

const buttonStyle = {
  marginTop: "16px",
  padding: "10px 16px",
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const successButton = {
  padding: "10px 16px",
  background: "#2e7d32",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default AIPlannerDemoPage;