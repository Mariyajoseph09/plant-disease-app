import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/predict";

const prettify = (label) => label.replace("___", " — ").replace(/_/g, " ").trim();

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
  };

  const onPredict = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(API_URL, { method: "POST", body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Prediction failed.");
      }
      setResult(await res.json());
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach the server. Is the backend running?"
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Plant Disease Classifier</h1>
      <p className="sub">Upload a leaf photo (apple, cherry or corn) to check for disease.</p>

      <input type="file" accept="image/*" onChange={onSelect} />

      {preview && <img className="preview" src={preview} alt="Selected leaf" />}

      <button onClick={onPredict} disabled={!file || loading}>
        {loading ? "Analyzing..." : "Predict"}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <h2>{prettify(result.prediction)}</h2>
          <p>Confidence: {result.confidence}%</p>
          <div className="bar">
            <div className="fill" style={{ width: `${result.confidence}%` }} />
          </div>
          {result.confidence < 85 && (
            <p className="warn">
              Low confidence. This may not be a supported leaf, or the photo may be unclear.
            </p>
          )}
          <h3>Top 3 guesses</h3>
          <ul>
            {result.top3.map((t) => (
              <li key={t.label}>
                {prettify(t.label)}: {t.confidence}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}