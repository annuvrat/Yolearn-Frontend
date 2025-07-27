import { useEffect, useState } from "react";
import { useRealtimeNotifications } from '../hooks/Realtime'
import toast, { Toaster } from 'react-hot-toast'
import { Search, Calendar, Filter, ChevronLeft, ChevronRight, FileText, Clock, Target, Bell } from "lucide-react";

export default function GetOutput({ token, userId }) {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const [outputs, setOutputs] = useState([]);
  const [page, setPage] = useState(1);
  const [tool, setTool] = useState("");
  const [date, setDate] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page,
      ...(tool && { tool }),
      ...(date && { date }),
    });

    try {
      const res = await fetch(`${baseURL}api/get-outputs/?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setOutputs(data.data || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load outputs");
    } finally {
      setLoading(false);
    }
  };

  // Handle new real-time output
  const handleNewOutput = (newOutput) => {
    // If we're on the first page and no filters, add the new output to the top
    if (page === 1 && !tool && !date) {
      setOutputs(prev => [newOutput, ...prev.slice(0, -1)]);
    } else {
      // Show a button to refresh and see the new output
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span>New output available!</span>
            <button
              onClick={() => {
                setPage(1);
                setTool("");
                setDate("");
                fetchData();
                toast.dismiss(t.id);
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              View
            </button>
          </div>
        ),
        {
          duration: 10000,
          icon: '📢',
        }
      );
    }
  };

  // Set up real-time notifications
  const { unsubscribe } = useRealtimeNotifications(
    realtimeEnabled ? userId : null,
    handleNewOutput
  );

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchData();
  };

  const clearFilters = () => {
    setTool("");
    setDate("");
    setPage(1);
    fetchData();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Output History</h1>
            
            {/* Real-time toggle */}
            <div className="flex items-center gap-2">
              <Bell className={`w-5 h-5 ${realtimeEnabled ? 'text-green-600' : 'text-gray-400'}`} />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={realtimeEnabled}
                  onChange={(e) => setRealtimeEnabled(e.target.checked)}
                  className="rounded"
                />
                Real-time notifications
              </label>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by tool name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={tool}
                onChange={(e) => setTool(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleFilter}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                <Filter className="w-4 h-4" />
                Apply
              </button>
              
              {(tool || date) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        ) : outputs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No outputs found</h3>
            <p className="text-gray-500">Try adjusting your filters or create some new outputs.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {outputs.map((output, index) => (
              <div
                key={output.id || index}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {output.tool_name}
                  </h3>
                  {output.output_content?.difficulty && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(output.output_content.difficulty)}`}>
                      {output.output_content.difficulty}
                    </span>
                  )}
                </div>

                {/* Date */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatDate(output.created_at)}
                </div>

                {/* Questions */}
                {output.output_content?.questions && output.output_content.questions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Target className="w-4 h-4 mr-2" />
                      Questions ({output.output_content.questions.length})
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {output.output_content.questions.slice(0, 3).map((question, i) => (
                        <div key={i} className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                          {question}
                        </div>
                      ))}
                      {output.output_content.questions.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{output.output_content.questions.length - 3} more questions
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 bg-white rounded-lg border border-gray-200 px-6 py-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </span>
            </div>
            
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}