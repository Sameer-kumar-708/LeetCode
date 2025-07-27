import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";
import {
  PlusCircle,
  Trash2,
  List,
  Code,
  CheckCircle,
  Eye,
  Key,
} from "lucide-react";

// Zod schema
const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.enum(["array", "linkedList", "graph", "dp"]),
  visibleTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
        explanation: z.string().min(1, "Explanation is required"),
      })
    )
    .min(1, "At least one visible test case required"),
  hiddenTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
      })
    )
    .min(1, "At least one hidden test case required"),
  startCode: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        initialCode: z.string().min(1, "Initial code is required"),
      })
    )
    .length(3),
  referenceSolution: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        completeCode: z.string().min(1, "Complete code is required"),
      })
    )
    .length(3),
});

export default function AdminPanel() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      visibleTestCases: [{ input: "", output: "", explanation: "" }],
      hiddenTestCases: [{ input: "", output: "" }],
      startCode: [
        { language: "C++", initialCode: "" },
        { language: "Java", initialCode: "" },
        { language: "JavaScript", initialCode: "" },
      ],
      referenceSolution: [
        { language: "C++", completeCode: "" },
        { language: "Java", completeCode: "" },
        { language: "JavaScript", completeCode: "" },
      ],
    },
  });

  const {
    fields: visible,
    append: addVisible,
    remove: removeVisible,
  } = useFieldArray({ control, name: "visibleTestCases" });
  const {
    fields: hidden,
    append: addHidden,
    remove: removeHidden,
  } = useFieldArray({ control, name: "hiddenTestCases" });

  const onSubmit = async (data) => {
    try {
      const res = await axiosClient.post("/problem/create", data);
      console.log(res);
      alert(res.data.message || "Problem created successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message);
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-6">
        📋 Create New Problem
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="card shadow-lg p-6 bg-[#222831]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">Title</label>
              <input
                {...register("title")}
                placeholder="Problem title"
                className="input input-bordered"
              />
              {errors.title && (
                <span className="text-sm text-error">
                  {errors.title.message}
                </span>
              )}
            </div>
            <div className="form-control">
              <label className="label">Difficulty</label>
              <select
                {...register("difficulty")}
                className="select select-bordered"
              >
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              {errors.difficulty && (
                <span className="text-sm text-error">
                  {errors.difficulty.message}
                </span>
              )}
            </div>
            <div className="form-control md:col-span-2">
              <label className="label flex items-center">
                Description <List className="ml-2" size={18} />
              </label>
              <textarea
                {...register("description")}
                className="textarea textarea-bordered h-32"
                placeholder="Describe the problem..."
              />
              {errors.description && (
                <span className="text-sm text-error">
                  {errors.description.message}
                </span>
              )}
            </div>
            <div className="form-control">
              <label className="label">Tag</label>
              <select {...register("tags")} className="select select-bordered">
                <option value="">Select tag</option>
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">Dynamic Programming</option>
              </select>
              {errors.tags && (
                <span className="text-sm text-error">
                  {errors.tags.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Visible Test Cases */}
        <div className="card shadow p-6 bg-[#222831]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium flex items-center">
              <Eye className="mr-2" /> Visible Test Cases
            </h2>
            <button
              type="button"
              className="btn btn-sm btn-primary flex items-center"
              onClick={() =>
                addVisible({ input: "", output: "", explanation: "" })
              }
            >
              <PlusCircle className="mr-1" size={16} /> Add Case
            </button>
          </div>
          <div className="space-y-4">
            {visible.map((field, idx) => (
              <div
                key={field.id}
                className="border border-gray-200 p-4 rounded-lg relative"
              >
                <button
                  type="button"
                  onClick={() => removeVisible(idx)}
                  className="absolute top-2 right-2 btn btn-xs btn-outline btn-error"
                >
                  <Trash2 size={14} />
                </button>
                <input
                  {...register(`visibleTestCases.${idx}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full mb-2"
                />
                <input
                  {...register(`visibleTestCases.${idx}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full mb-2"
                />
                <textarea
                  {...register(`visibleTestCases.${idx}.explanation`)}
                  placeholder="Explanation"
                  className="textarea textarea-bordered w-full"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Test Cases */}
        <div className="card shadow p-6 bg-[#222831]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium flex items-center">
              <Key className="mr-2" /> Hidden Test Cases
            </h2>
            <button
              type="button"
              className="btn btn-sm btn-secondary flex items-center"
              onClick={() => addHidden({ input: "", output: "" })}
            >
              <PlusCircle className="mr-1" size={16} /> Add Case
            </button>
          </div>
          <div className="space-y-4">
            {hidden.map((field, idx) => (
              <div
                key={field.id}
                className="border border-gray-200 p-4 rounded-lg relative"
              >
                <button
                  type="button"
                  onClick={() => removeHidden(idx)}
                  className="absolute top-2 right-2 btn btn-xs btn-outline btn-error"
                >
                  <Trash2 size={14} />
                </button>
                <input
                  {...register(`hiddenTestCases.${idx}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full mb-2"
                />
                <input
                  {...register(`hiddenTestCases.${idx}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Code Section */}
        <div className="card shadow-lg p-6 bg-[#222831]">
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <Code className="mr-2" /> Code Templates
          </h2>
          <div className="tabs tabs-boxed mb-4">
            {["C++", "Java", "JavaScript"].map((lang, i) => (
              <button key={i} className={`tab ${i === 0 ? "tab-active" : ""}`}>
                {lang}
              </button>
            ))}
          </div>
          {[0, 1, 2].map((idx) => {
            const language = ["C++", "Java", "JavaScript"][idx];
            return (
              <div key={idx} className="mb-6">
                <h3 className="font-semibold text-lg mb-2">
                  Start Code ({language})
                </h3>
                <textarea
                  {...register(`startCode.${idx}.initialCode`)}
                  className="textarea textarea-bordered w-full h-24 mb-4"
                  placeholder={`Starter code in ${language}`}
                />
                <h3 className="font-semibold text-lg mb-2">
                  Reference Solution ({language})
                </h3>
                <textarea
                  {...register(`referenceSolution.${idx}.completeCode`)}
                  className="textarea textarea-bordered w-full h-24"
                  placeholder={`Solution code in ${language}`}
                />
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full py-3 text-lg font-semibold flex justify-center items-center"
        >
          <CheckCircle className="mr-2" size={20} /> Create Problem
        </button>
      </form>
    </div>
  );
}
