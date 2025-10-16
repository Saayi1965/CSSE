import React, { useState } from "react";
import { recordCollection, emptyBin } from "../../api/api";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/collector.css";

export default function UpdatePickup() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const bin = state?.bin;
  const [weight, setWeight] = useState("");

  const handleUpdate = async () => {
    if (!weight) return alert("Enter weight");
    try {
      await recordCollection({ binId: bin.id, weightKg: parseFloat(weight) });
      await emptyBin(bin.id);
      alert("✅ Collection recorded & bin emptied");
      navigate("/collector/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error updating bin");
    }
  };

  return (
    <div className="collector-container">
      <h2>🚛 Update Pickup</h2>
      <p><b>Bin ID:</b> {bin?.id}</p>
      <p><b>Location:</b> {bin?.location}</p>
      <input
        type="number"
        placeholder="Weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
