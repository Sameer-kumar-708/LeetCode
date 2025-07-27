import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { logoutUser } from "../authSlice";
import { User, LogOut, List, Search, Boxes, CheckCircle2 } from "lucide-react";

export default function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    difficulty: "all",
    tag: "all",
    status: "all",
  });

  useEffect(() => {
    async function load() {
      try {
        const { data: all } = await axiosClient.get("/problem/getAllProblem");
        setProblems(Array.isArray(all) ? all : []);
        if (user) {
          const { data: solved } = await axiosClient.get(
            "/problem/solvedProblem"
          );
          setSolvedProblems(Array.isArray(solved) ? solved : []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const applyFilters = (list) =>
    list.filter((p) => {
      const diffOk =
        filters.difficulty === "all" || p.difficulty === filters.difficulty;
      const tagOk = filters.tag === "all" || p.tags === filters.tag;
      const statusOk =
        filters.status === "all" ||
        (filters.status === "solved"
          ? solvedProblems.some((sp) => sp._id === p._id)
          : true);
      const textOk = p.title.toLowerCase().includes(searchText.toLowerCase());
      return diffOk && tagOk && statusOk && textOk;
    });

  const display = applyFilters(problems);

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-neutral text-neutral-content px-8">
        <NavLink
          to="/"
          className="btn btn-ghost normal-case text-xl flex items-center gap-2"
        >
          <Boxes className="w-full h-10" />
          Codex
        </NavLink>
        <div className="flex-1 justify-center">
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search problems..."
                className="input input-bordered h-8"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <button className="btn btn-primary h-8">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="w-6 h-7 m-[6px] text-white" />
            </div>
          </label>
          <ul
            tabIndex={0}
            className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
          >
            <li className="font-semibold">{user?.firstName}</li>
            <li>
              <button onClick={handleLogout} className="justify-between">
                Logout
                <LogOut className="w-4 h-4" />
              </button>
            </li>
            {user?.role === "admin" && (
              <li>
                <NavLink to="/admin">Admin Panel</NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <select
            className="select select-bordered"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Status</option>
            <option value="solved">Solved</option>
          </select>

          <select
            className="select select-bordered"
            value={filters.difficulty}
            onChange={(e) =>
              setFilters({ ...filters, difficulty: e.target.value })
            }
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            className="select select-bordered"
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
          >
            <option value="all">All Tags</option>
            <option value="array">Array</option>
            <option value="linkedList">Linked List</option>
            <option value="graph">Graph</option>
            <option value="dp">Dynamic Programming</option>
          </select>
        </div>

        {/* Problem Grid */}
        <div className="grid gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
          {display.map((problem) => (
            <div
              key={problem._id}
              className="card bg-base-100 shadow hover:shadow-lg transition"
            >
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <NavLink
                    to={`/problem/${problem._id}`}
                    className="card-title hover:text-primary transition"
                  >
                    {problem.title}
                  </NavLink>
                  {solvedProblems.some((sp) => sp._id === problem._id) && (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`badge badge-outline ${getDifficultyColor(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>
                  <span
                    className={`badge badge-outline ${getTagColor(
                      problem.tags
                    )}`}
                  >
                    {problem.tags}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helpers
const getDifficultyColor = (d) => {
  switch (d.toLowerCase()) {
    case "easy":
      return "badge-success";
    case "medium":
      return "badge-warning";
    case "hard":
      return "badge-error";
    default:
      return "badge-outline";
  }
};
const getTagColor = (t) => {
  switch (t.toLowerCase()) {
    case "array":
      return "badge-info";
    case "linkedlist":
      return "badge-secondary";
    case "graph":
      return "badge-accent";
    case "dp":
      return "badge-primary";
    default:
      return "badge-outline";
  }
};
