import { useState } from "react";

function AddApplicationModal({ onClose }) {
    const [formData, setFormData] = useState({
        company: "",
        role: "",
        date: "",
        cv: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "cv") {
            setFormData({ ...formData, cv: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async () => {
        if (!formData.company || !formData.role || !formData.date) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company: formData.company,
                    role: formData.role,
                    date_applied: formData.date,
                    cv_url: null,
                    status: 'applied',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Application for ${data.company} added!`);
                onClose();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (err) {
            alert('Could not connect to server.');
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
        >
            <div
                className="relative w-full max-w-md rounded-2xl p-8 border border-white border-opacity-10 shadow-2xl"
                style={{ backgroundColor: "#0a0f1e" }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-xl font-bold"
                >
                    ✕
                </button>

                {/* Title */}
                <h2 className="text-2xl font-black text-white mb-6">
                    New <span className="text-emerald-400">Application</span>
                </h2>

                {/* Company */}
                <div className="mb-4">
                    <label className="text-gray-400 text-sm font-semibold mb-1 block">
                        Company Name
                    </label>
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="e.g. Google"
                        className="w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                </div>

                {/* Role */}
                <div className="mb-4">
                    <label className="text-gray-400 text-sm font-semibold mb-1 block">
                        Job Role
                    </label>
                    <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder="e.g. Software Engineer"
                        className="w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                </div>

                {/* Date */}
                <div className="mb-4">
                    <label className="text-gray-400 text-sm font-semibold mb-1 block">
                        Date Applied
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                </div>

                {/* CV Upload */}
                <div className="mb-6">
                    <label className="text-gray-400 text-sm font-semibold mb-1 block">
                        Upload CV <span className="text-gray-600">(optional)</span>
                    </label>
                    <input
                        type="file"
                        name="cv"
                        accept=".pdf,.doc,.docx"
                        onChange={handleChange}
                        className="w-full text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-emerald-400 transition"
                    />
                    {formData.cv && (
                        <p className="text-emerald-400 text-xs mt-2">✓ {formData.cv.name}</p>
                    )}
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 hover:scale-105 text-white font-black py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/30"
                >
                    Add Application
                </button>

            </div>
        </div>
    );
}

export default AddApplicationModal;