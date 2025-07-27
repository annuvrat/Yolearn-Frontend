import { useState } from "react";
import { Plus, Trash2, Send, Settings, HelpCircle, Target, CheckCircle, X } from "lucide-react";

export default function PostOutput({ token }) {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const [toolName, setToolName] = useState("");
  const [questions, setQuestions] = useState([""]);
  const [difficulty, setDifficulty] = useState("easy");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChangeQuestion = (index, value) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const addQuestion = () => setQuestions([...questions, ""]);

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
    }
  };

  const validateForm = () => {
    if (!toolName.trim()) {
      setError("Tool name is required");
      return false;
    }
    
    const validQuestions = questions.filter(q => q.trim());
    if (validQuestions.length === 0) {
      setError("At least one question is required");
      return false;
    }
    
    return true;
  };

  const handlePost = async () => {
    setError("");
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const validQuestions = questions.filter(q => q.trim());
      
      const res = await fetch(`${baseURL}api/store-output/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tool_name: toolName.trim(),
          output_content: { questions: validQuestions, difficulty },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit output");
      }

      const data = await res.json();
      console.log("POST response:", data);
      
      setSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setToolName("");
        setQuestions([""]);
        setDifficulty("easy");
        setSuccess(false);
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Failed to submit output");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyInfo = (level) => {
    switch (level) {
      case 'easy':
        return { color: 'text-green-600', bg: 'bg-green-50 border-green-200', desc: 'Basic concepts and simple tasks' };
      case 'medium':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', desc: 'Moderate complexity with some challenges' };
      case 'hard':
        return { color: 'text-red-600', bg: 'bg-red-50 border-red-200', desc: 'Advanced concepts requiring expertise' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', desc: '' };
    }
  };

  const difficultyInfo = getDifficultyInfo(difficulty);

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">Output Submitted Successfully!</h3>
          <p className="text-green-700">Your output has been saved and will be available in the history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Submit New Output</h2>
          </div>
          <p className="text-gray-600">Create a new output entry with questions and difficulty level.</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <X className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Tool Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Settings className="w-4 h-4" />
              Tool Name
            </label>
            <input
              type="text"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="Enter the name of your tool..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Target className="w-4 h-4" />
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            
            {/* Difficulty Info */}
            <div className={`p-3 rounded-lg border ${difficultyInfo.bg}`}>
              <p className={`text-sm ${difficultyInfo.color}`}>
                {difficultyInfo.desc}
              </p>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <HelpCircle className="w-4 h-4" />
              Questions ({questions.filter(q => q.trim()).length})
            </label>
            
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => handleChangeQuestion(index, e.target.value)}
                      placeholder={`Question ${index + 1}...`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Question Button */}
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Another Question
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Make sure all information is accurate before submitting.
            </div>
            
            <button
              onClick={handlePost}
              disabled={loading || !toolName.trim() || questions.every(q => !q.trim())}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Output
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}