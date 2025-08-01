import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { Trash2, Search } from "lucide-react";

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      setFiltered(
        problems.filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            (Array.isArray(p.tags)
              ? p.tags.join(" ").toLowerCase().includes(query.toLowerCase())
              : String(p.tags).toLowerCase().includes(query.toLowerCase()))
        )
      );
    } else {
      setFiltered(problems);
    }
  }, [query, problems]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/problem/getAllProblem");
      setProblems(data);
      setFiltered(data);
    } catch (err) {
      setError("Failed to fetch problems");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?"))
      return;
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      const updated = problems.filter((p) => p._id !== id);
      setProblems(updated);
      setFiltered(updated);
    } catch (err) {
      setError("Failed to delete problem");
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  if (error)
    return (
      <div className="alert alert-error shadow-lg my-4">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Manage Problems</h1>
        <div className="form-control w-full md:w-1/3">
          <div className="input-group flex">
            <input
              type="text"
              placeholder="Search by title or tag..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input input-bordered w-full"
            />
            <button className="btn btn-square">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full lg:table-zebra">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Tags</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((problem, index) => {
              const tagsList = Array.isArray(problem.tags)
                ? problem.tags
                : problem.tags
                ? String(problem.tags).split(/,|\s+/).filter(Boolean)
                : [];
              return (
                <tr key={problem._id} className="hover">
                  <th>{index + 1}</th>
                  <td className="max-w-xs truncate" title={problem.title}>
                    {problem.title}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        problem.difficulty === "Easy"
                          ? "badge-success"
                          : problem.difficulty === "Medium"
                          ? "badge-warning"
                          : "badge-error"
                      }`}
                    >
                      {" "}
                      {problem.difficulty}{" "}
                    </span>
                  </td>
                  <td>
                    {tagsList.map((tag) => (
                      <span key={tag} className="badge badge-outline mr-1 mb-1">
                        {tag}
                      </span>
                    ))}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => handleDelete(problem._id)}
                      className="btn btn-circle btn-sm btn-error tooltip tooltip-warning"
                      data-tip="Delete Problem"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDelete;
