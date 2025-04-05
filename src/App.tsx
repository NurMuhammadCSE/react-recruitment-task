import { useState, useEffect } from "react";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const baseUrl = "https://sugarytestapi.azurewebsites.net/";
const listPath = "TestApi/GetComplains";
const savePath = "TestApi/SaveComplain";

interface Complain {
  Id: number;
  Title: string;
  Body: string;
}

interface ApiResponse {
  Success: boolean;
  Message?: string;
}

function App() {
  const [complains, setComplains] = useState<Complain[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchComplains = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${baseUrl}${listPath}`);
        if (!response.ok) throw new Error("Failed to fetch complaints.");
        const data = await response.json();
        if (isMounted) setComplains(data);
      } catch (e) {
        if (isMounted) {
          toast.error((e as Error).message || "Something went wrong.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchComplains();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Please fill in both Title and Complaint.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`${baseUrl}${savePath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Title: title, Body: body }),
      });

      const data: ApiResponse = await response.json();
      if (!data.Success) throw new Error(data.Message || "Failed to save complaint.");

      toast.success("Complaint submitted successfully!");
      setTitle("");
      setBody("");

      // Refetch the list
      const listResponse = await fetch(`${baseUrl}${listPath}`);
      const updatedData = await listResponse.json();
      setComplains(updatedData);
    } catch (e) {
      toast.error((e as Error).message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="wrapper">
      <h2>Submit a Complaint</h2>

      <div className="complain-form">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSaving}
          autoFocus
          aria-label="Title input"
        />

        <label htmlFor="body">Complaint</label>
        <textarea
          id="body"
          placeholder="Enter your complaint"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isSaving}
          aria-label="Complaint input"
        />

        <button
          onClick={handleSubmit}
          disabled={isSaving || !title.trim() || !body.trim()}
          aria-busy={isSaving}
          aria-label="Submit Complaint"
        >
          {isSaving ? "Submitting..." : "Submit Complaint"}
        </button>
      </div>

      <h2>Complaints List</h2>

      {isLoading ? (
        <div role="status" aria-live="polite" style={{ textAlign: "center", margin: "1rem 0" }}>
          <div className="spinner" />
          <p>Loading complaints...</p>
        </div>
      ) : complains.length > 0 ? (
        <div className="complain-grid">
          {complains.map((complain) => (
            <motion.div
              key={complain.Id}
              className="complain-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3>{complain.Title}</h3>
              <p>{complain.Body}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p>No complaints available.</p>
      )}

      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
    </div>
  );
}

export default App;
