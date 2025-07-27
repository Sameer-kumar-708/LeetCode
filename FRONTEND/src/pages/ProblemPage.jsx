import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from "../components/ChatAi";
import Editorial from "../components/Editorial";
import { motion } from "framer-motion";
import {
  FileText,
  BookOpen,
  Code,
  CheckCircle,
  ListVideo,
  Zap,
  Play,
  Terminal,
} from "lucide-react";

const langMap = { cpp: "C++", java: "Java", javascript: "JavaScript" };

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");
  const editorRef = useRef(null);
  const { problemId } = useParams();
  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get(
          `/problem/getProblemById/${problemId}`
        );
        const initial =
          data.startCode.find((s) => s.language === langMap[selectedLanguage])
            ?.initialCode || "";
        setProblem(data);
        setCode(initial);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId, selectedLanguage]);

  const handleEditorChange = (v) => setCode(v || "");
  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const { data } = await axiosClient.post(
        `/submittion/run/${problemId}`,
        { code, language: selectedLanguage },
        { timeout: 15000 }
      );
      setRunResult(data);
      setActiveRightTab("testcase");
    } catch (e) {
      setRunResult({ success: false, error: e.message });
      setActiveRightTab("testcase");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const { data } = await axiosClient.post(
        `/submittion/submit/${problemId}`,
        { code, language: selectedLanguage }
      );
      setSubmitResult(data);
      setActiveRightTab("result");
    } catch (e) {
      setSubmitResult({ accepted: false, error: e.message });
      setActiveRightTab("result");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !problem)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <motion.span
          className="loading loading-spinner loading-xl text-primary"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#222831] text-white">
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full lg:w-1/2 flex flex-col border-r border-gray-700 bg-[#222831] shadow-lg"
      >
        <div className="tabs tabs-boxed bg-gray-900">
          {[
            { id: "description", icon: FileText, label: "Description" },
            { id: "editorial", icon: BookOpen, label: "Editorial" },
            { id: "solutions", icon: Code, label: "Solutions" },
            { id: "submittion", icon: ListVideo, label: "Submissions" },
            { id: "chatAI", icon: Zap, label: "Chat AI" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveLeftTab(id)}
              className={`tab flex items-center space-x-1 hover:bg-primary/10 transition ${
                activeLeftTab === id ? "tab-active bg-primary/20" : ""
              }`}
            >
              <Icon /> <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {problem && activeLeftTab === "description" && (
            <article className="space-y-4">
              <motion.h1
                className="text-2xl font-bold"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                {problem.title}
              </motion.h1>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`badge badge-outline ${getDifficultyColor(
                    problem.difficulty
                  )}`}
                >
                  {" "}
                  {cap(problem.difficulty)}{" "}
                </span>
                {normalizeTags(problem.tags).map((tag) => (
                  <motion.span
                    key={tag}
                    className="badge badge-primary"
                    whileHover={{ scale: 1.05 }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
              <div className="prose max-w-none text-gray-300">
                <pre className="whitespace-pre-wrap">{problem.description}</pre>
              </div>
              <section>
                <h3 className="text-lg font-semibold mb-2">Examples</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {problem.visibleTestCases.map((ex, i) => (
                    <motion.div
                      key={i}
                      className="bg-gray-700 p-4 rounded-lg shadow"
                      whileHover={{ scale: 1.02 }}
                    >
                      <h4 className="font-semibold">Example {i + 1}</h4>
                      <p>
                        <strong>Input:</strong> {ex.input}
                      </p>
                      <p>
                        <strong>Output:</strong> {ex.output}
                      </p>
                      <p className="mt-2 text-sm text-gray-400">
                        <strong>Explanation:</strong> {ex.explanation}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>
            </article>
          )}
          {problem && activeLeftTab === "editorial" && (
            <Editorial
              secureUrl={problem.secureUrl}
              thumbnailUrl={problem.thumbnailUrl}
              duration={problem.duration}
            />
          )}
          {problem && activeLeftTab === "solutions" && (
            <div className="space-y-4">
              {problem.referenceSolution?.length ? (
                problem.referenceSolution.map((sol, i) => (
                  <motion.div
                    key={i}
                    className="border rounded-lg shadow-sm hover:shadow-md transition"
                  >
                    <div className="bg-gray-700 p-2 flex items-center space-x-2">
                      <Code /> <span>{sol.language}</span>
                    </div>
                    <pre className="p-4 overflow-x-auto bg-[#222831] text-white">
                      <code>{sol.completeCode}</code>
                    </pre>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-400">No solutions yet.</p>
              )}
            </div>
          )}
          {activeLeftTab === "submittion" && (
            <SubmissionHistory problemId={problemId} />
          )}
          {activeLeftTab === "chatAI" && <ChatAi problem={problem} />}
        </div>
      </motion.div>
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full lg:w-1/2 flex flex-col bg-gray-800 shadow-lg"
      >
        <div className="tabs tabs-boxed bg-gray-900">
          {[
            { id: "code", icon: Terminal, label: "Code" },
            { id: "testcase", icon: Play, label: "Testcase" },
            { id: "result", icon: CheckCircle, label: "Result" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveRightTab(id)}
              className={`tab flex items-center space-x-1 hover:bg-primary/10 transition ${
                activeRightTab === id ? "tab-active bg-primary/20" : ""
              }`}
            >
              <Icon /> <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          {activeRightTab === "code" && (
            <div className="flex flex-col flex-1">
              <div className="flex flex-wrap items-center p-4 border-b border-gray-700 gap-2">
                {Object.keys(langMap).map((lang) => (
                  <motion.button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`btn btn-sm ${
                      selectedLanguage === lang
                        ? "btn-primary shadow"
                        : "btn-ghost text-white"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {langMap[lang]}
                  </motion.button>
                ))}
              </div>
              <Editor
                className="flex-1"
                language={selectedLanguage}
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{ automaticLayout: true, minimap: { enabled: false } }}
              />
              <div className="flex justify-end p-4 space-x-2 border-t border-gray-700">
                <motion.button
                  onClick={handleRun}
                  disabled={loading}
                  className={`btn btn-outline btn-sm ${
                    loading ? "loading" : ""
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <Zap className="mr-1" /> Run
                </motion.button>
                <motion.button
                  onClick={handleSubmitCode}
                  disabled={loading}
                  className={`btn btn-primary btn-sm ${
                    loading ? "loading" : ""
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <Play className="mr-1" /> Submit
                </motion.button>
              </div>
            </div>
          )}
          {activeRightTab === "testcase" && (
            <div className="p-4 overflow-y-auto text-white">
              {runResult ? (
                <div
                  className={`alert ${
                    runResult.success ? "alert-success" : "alert-error"
                  }`}
                >
                  {runResult.success ? "🎉 All passed!" : runResult.error}
                </div>
              ) : (
                <p className="text-gray-400">Click Run to execute.</p>
              )}
            </div>
          )}
          {activeRightTab === "result" && (
            <div className="p-4 overflow-y-auto text-white">
              {submitResult ? (
                <div
                  className={`alert ${
                    submitResult.accepted ? "alert-success" : "alert-error"
                  }`}
                >
                  {submitResult.accepted ? "🎉 Accepted!" : submitResult.error}
                </div>
              ) : (
                <p className="text-gray-400">Click Submit to evaluate.</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProblemPage;

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags;
  return tags ? String(tags).split(/,|\s+/).filter(Boolean) : [];
}
function getDifficultyColor(diff) {
  switch (diff.toLowerCase()) {
    case "easy":
      return "text-green-400";
    case "medium":
      return "text-yellow-400";
    case "hard":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}
function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
