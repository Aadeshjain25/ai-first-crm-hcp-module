import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Loader2,
  Mic,
  Plus,
  Search,
  Smile,
  Meh,
  Frown,
  X,
  XCircle,
} from "lucide-react";

import { createInteraction } from "../../../services/api";
import { fetchInteractions } from "../../../store/slices/historySlice";
import {
  resetFormData,
  updateFormData,
} from "../../../store/slices/interactionSlice";

// Appends a new comma-separated entry onto an existing "materials_shared" /
// "samples_distributed" string without disturbing whatever's already there.
function appendListValue(existing, entry) {
  const trimmed = entry.trim();
  if (!trimmed) return existing;
  const items = (existing || "")
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);
  if (items.includes(trimmed)) return existing;
  return [...items, trimmed].join(", ");
}

function removeListValue(existing, entry) {
  const items = (existing || "")
    .split(",")
    .map((i) => i.trim())
    .filter((i) => i && i !== entry);
  return items.join(", ");
}

function buildInteractionPayload(formData) {
  return {
    hcp_name: formData.hcp_name.trim(),
    interaction_type: formData.interaction_type.trim(),
    interaction_date: formData.interaction_date,
    interaction_time: formData.interaction_time,
    location: formData.location.trim() || null,
    discussion: formData.discussion.trim() || null,
    products_discussed: formData.products_discussed.trim() || null,
    materials_shared: formData.materials_shared.trim() || null,
    samples_distributed: formData.samples_distributed.trim() || null,
    sentiment: formData.sentiment || null,
    outcome: formData.outcome.trim() || null,
    follow_up: formData.follow_up.trim() || null,
    ai_summary: formData.ai_summary.trim() || null,
  };
}

function validateInteraction(formData) {
  if (!formData.hcp_name.trim()) return "HCP Name is required.";
  if (!formData.interaction_type.trim()) return "Interaction Type is required.";
  if (!formData.interaction_date) return "Date is required.";
  if (!formData.interaction_time) return "Time is required.";
  return null;
}

function ListEditor({ label, value, placeholder, buttonLabel, buttonIcon: ButtonIcon, onAdd, onRemove }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const items = (value || "").split(",").map((i) => i.trim()).filter(Boolean);

  const submit = () => {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft("");
    setOpen(false);
  };

  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-slate-800">{label}</p>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        >
          <ButtonIcon size={16} />
          <span>{buttonLabel}</span>
        </button>
      </div>

      {items.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="text-slate-400 transition hover:text-red-500"
                aria-label={`Remove ${item}`}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-slate-500">No {label.toLowerCase()} added.</p>
      )}

      {open && (
        <div className="mt-3 flex gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={submit}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

function VoiceNoteModal({ onClose, onInsert }) {
  const [consented, setConsented] = useState(false);
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">
          Summarize from Voice Note
        </h3>

        {!consented ? (
          <>
            <p className="mt-3 text-sm text-slate-600">
              This will use the contents of a voice note you provide to add
              to your discussion notes. Recording audio directly isn't
              available in this build - paste or type the transcript
              instead. Do you consent to processing this note?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setConsented(true)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                I Consent, Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-slate-600">
              Paste or type the voice note transcript below. It will be
              appended to Topics Discussed.
            </p>
            <textarea
              autoFocus
              rows={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Discussed CardioX dosing, doctor asked for more clinical data..."
              className="mt-3 w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!note.trim()}
                onClick={() => onInsert(note)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Insert into Topics Discussed
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function InteractionForm() {
  const dispatch = useDispatch();
  const { formData, summary, followUps, insights } = useSelector(
    (state) => state.interaction
  );

  const [saving, setSaving] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success" | "error", text }

  const handleChange = (e) => {
    dispatch(
      updateFormData({
        [e.target.name]: e.target.value,
      })
    );
  };

  const handleListChange = (field, nextValue) => {
    dispatch(updateFormData({ [field]: nextValue }));
  };

  const saveInteraction = async () => {
    if (saving) return;

    const validationError = validateInteraction(formData);
    if (validationError) {
      setToast({ type: "error", text: validationError });
      return;
    }

    setSaving(true);
    setToast(null);

    try {
      await createInteraction(buildInteractionPayload(formData));
      setToast({ type: "success", text: "Interaction saved successfully." });
      dispatch(resetFormData());
      dispatch(fetchInteractions());
    } catch (err) {
      setToast({ type: "error", text: err.message || "Failed to save interaction." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      {voiceModalOpen && (
        <VoiceNoteModal
          onClose={() => setVoiceModalOpen(false)}
          onInsert={(note) => {
            dispatch(
              updateFormData({
                discussion: formData.discussion
                  ? `${formData.discussion}\n${note.trim()}`
                  : note.trim(),
              })
            );
            setVoiceModalOpen(false);
          }}
        />
      )}

      <div className="border-b border-slate-100 px-8 py-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Log HCP Interaction
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Interaction Details
        </p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              HCP Name
            </label>

            <input
              name="hcp_name"
              value={formData.hcp_name}
              onChange={handleChange}
              placeholder="Search or select HCP..."
              className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Interaction Type
            </label>

            <select
              name="interaction_type"
              value={formData.interaction_type}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              <option>Meeting</option>
              <option>Phone Call</option>
              <option>Video Call</option>
              <option>Email</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Date
            </label>

            <div className="relative">
              <input
                type="date"
                name="interaction_date"
                value={formData.interaction_date}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 pr-11 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Calendar
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Time
            </label>

            <div className="relative">
              <input
                type="time"
                name="interaction_time"
                value={formData.interaction_time}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 pr-11 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Clock3
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Attendees / Location
          </label>

          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter names, clinic, or location..."
            className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Topics Discussed
          </label>

          <textarea
            rows={4}
            name="discussion"
            value={formData.discussion}
            onChange={handleChange}
            placeholder="Enter key discussion points..."
            className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 resize-none outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={() => setVoiceModalOpen(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl px-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
          >
            <Mic size={15} />
            <span>Summarize from Voice Note (Requires Consent)</span>
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-[28px] font-semibold tracking-tight text-slate-800">
            Materials Shared / Samples Distributed
          </h3>

          <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200">
            <ListEditor
              label="Materials Shared"
              value={formData.materials_shared}
              placeholder="e.g. CardioX brochure"
              buttonLabel="Search/Add"
              buttonIcon={Search}
              onAdd={(entry) =>
                handleListChange("materials_shared", appendListValue(formData.materials_shared, entry))
              }
              onRemove={(entry) =>
                handleListChange("materials_shared", removeListValue(formData.materials_shared, entry))
              }
            />

            <ListEditor
              label="Samples Distributed"
              value={formData.samples_distributed}
              placeholder="e.g. CardioX 10mg x2"
              buttonLabel="Add Sample"
              buttonIcon={Plus}
              onAdd={(entry) =>
                handleListChange("samples_distributed", appendListValue(formData.samples_distributed, entry))
              }
              onRemove={(entry) =>
                handleListChange("samples_distributed", removeListValue(formData.samples_distributed, entry))
              }
            />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-xl font-semibold text-slate-800">
            Observed/Inferred HCP Sentiment
          </h3>

          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {["Positive", "Neutral", "Negative"].map((item) => (
              <label
                key={item}
                className="flex items-center gap-3 text-lg text-slate-700 cursor-pointer"
              >
                <input
                  type="radio"
                  name="sentiment"
                  value={item}
                  checked={formData.sentiment === item}
                  onChange={handleChange}
                />

                <span className="flex items-center gap-2">
                  {item === "Positive" && <Smile size={18} />}
                  {item === "Neutral" && <Meh size={18} />}
                  {item === "Negative" && <Frown size={18} />}
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Outcomes
          </label>

          <textarea
            rows={4}
            name="outcome"
            value={formData.outcome}
            onChange={handleChange}
            placeholder="Key outcomes or agreements..."
            className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 resize-none outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Follow-up Actions
          </label>

          <textarea
            rows={3}
            name="follow_up"
            value={formData.follow_up}
            onChange={handleChange}
            placeholder="Enter next steps or tasks..."
            className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 resize-none outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {summary && (
          <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="mb-2 font-semibold text-blue-700">
              AI Summary
            </h3>

            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
              {summary}
            </pre>
          </div>
        )}

        {followUps?.length > 0 && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
            <h3 className="mb-3 font-semibold text-green-700">
              AI Suggested Follow-ups
            </h3>

            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
              {followUps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {insights?.length > 0 && (
          <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5">
            <h3 className="mb-3 font-semibold text-purple-700">
              AI Insights
            </h3>

            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
              {insights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {toast && (
          <div
            className={`mt-6 flex items-center gap-2 rounded-2xl border p-4 text-sm font-medium ${
              toast.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <XCircle size={18} />
            )}
            {toast.text}
          </div>
        )}

        <button
          onClick={saveInteraction}
          disabled={saving}
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving && <Loader2 size={20} className="animate-spin" />}
          {saving ? "Saving..." : "Save Interaction"}
        </button>
      </div>
    </div>
  );
}
