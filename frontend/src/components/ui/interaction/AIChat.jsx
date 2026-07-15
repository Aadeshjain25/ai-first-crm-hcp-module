import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bot, Send, Sparkles, Wand2 } from "lucide-react";

import {
  editInteractionFromChat,
  getInteractionFollowUps,
  getInteractionInsights,
  getInteractionSummary,
  logInteractionFromChat,
} from "../../../services/api";
import {
  setFollowUps,
  setInsights,
  setSummary,
  updateFormData,
} from "../../../store/slices/interactionSlice";

let messageIdCounter = 0;
const nextMessageId = () => `msg-${++messageIdCounter}`;

// Minimal **bold** markdown renderer so success/error copy from the AI can
// emphasize key details (e.g. the HCP name) without pulling in a full
// markdown parser dependency.
function renderRichText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function AIChat() {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.interaction.formData);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: nextMessageId(),
      role: "assistant",
      tone: "intro",
      text: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure") or ask for help.',
    },
  ]);
  const [mode, setMode] = useState("log");

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const pushMessage = (msg) =>
    setMessages((prev) => [...prev, { id: nextMessageId(), ...msg }]);

  const extractInteraction = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message;
    pushMessage({ role: "user", text: userMessage });
    setMessage("");
    setLoading(true);

    try {
      const res =
        mode === "log"
          ? await logInteractionFromChat(userMessage)
          : await editInteractionFromChat(formData, userMessage);

      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5);

      const cleanedData = {};
      Object.entries(res.data).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          cleanedData[key] = value;
        }
      });

      const nextFormData = {
        ...formData,
        ...cleanedData,
        interaction_type:
          cleanedData.interaction_type || formData.interaction_type || "Meeting",
        interaction_date: cleanedData.interaction_date || formData.interaction_date || today,
        interaction_time: cleanedData.interaction_time || formData.interaction_time || currentTime,
      };

      dispatch(updateFormData(nextFormData));

      const hcpName = nextFormData.hcp_name || "this HCP interaction";
      pushMessage({
        role: "assistant",
        tone: "success",
        text:
          mode === "log"
            ? `**Interaction logged successfully!** The form has been automatically populated for ${hcpName}. Generating a summary, follow-ups, and insights now...`
            : `**Interaction updated successfully** for ${hcpName}.`,
      });

      // Use the cleaned, default-filled form data for downstream AI steps so
      // summaries and follow-ups reflect the exact data the user now sees.
      const results = await Promise.allSettled([
        getInteractionSummary(nextFormData),
        getInteractionFollowUps(nextFormData),
        getInteractionInsights(nextFormData),
      ]);

      const [summaryResult, followUpResult, insightsResult] = results;

      if (summaryResult.status === "fulfilled") {
        dispatch(setSummary(summaryResult.value.data.summary));
        dispatch(updateFormData({ ai_summary: summaryResult.value.data.summary }));
      }

      if (followUpResult.status === "fulfilled") {
        dispatch(setFollowUps(followUpResult.value.data.actions || []));
      }

      if (insightsResult.status === "fulfilled") {
        dispatch(setInsights(insightsResult.value.data.insights || []));
      }

      const failedCount = results.filter((r) => r.status === "rejected").length;
      if (failedCount > 0) {
        pushMessage({
          role: "assistant",
          tone: "error",
          text: `Interaction data was saved to the form, but ${failedCount} of 3 AI enrichment step(s) (summary/follow-ups/insights) failed. You can still save the interaction manually.`,
        });
      } else {
        pushMessage({
          role: "assistant",
          tone: "success",
          text: "**Summary, follow-ups, and insights are ready** below the form. Review them, then click Save Interaction when you're happy with it.",
        });
      }
    } catch (err) {
      pushMessage({
        role: "assistant",
        tone: "error",
        text: `Something went wrong while extracting the interaction: ${err.message || "unknown error"}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      extractInteraction();
    }
  };

  const messageClassName = (msg) => {
    if (msg.role === "user") {
      return "bg-white border border-slate-200 text-slate-700";
    }

    if (msg.tone === "success") {
      return "bg-green-50 border border-green-200 text-slate-700";
    }

    if (msg.tone === "error") {
      return "bg-red-50 border border-red-200 text-slate-700";
    }

    return "bg-cyan-50 border border-cyan-100 text-slate-700";
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Bot size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-[28px] leading-none font-bold text-blue-600">
              AI Assistant
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Log interaction details here via chat
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setMode("log")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "log"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Log
          </button>

          <button
            onClick={() => setMode("edit")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "edit"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Edit
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-slate-50/60 px-5 py-5 space-y-4 scroll-smooth"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[92%] rounded-2xl px-4 py-4 text-[15px] leading-7 shadow-sm ${messageClassName(
                msg
              )}`}
            >
              {renderRichText(msg.text)}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-4 text-sm text-slate-700 shadow-sm">
              <span>AI is analyzing the interaction</span>
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-white p-4">
        <div className="flex items-end gap-3">
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe interaction... (Enter to send, Shift+Enter for a new line)"
            className="min-h-[58px] flex-1 rounded-2xl border border-slate-300 px-4 py-4 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={extractInteraction}
            disabled={loading || !message.trim()}
            className={`flex h-[58px] min-w-[84px] flex-col items-center justify-center rounded-[22px] px-4 text-sm font-bold text-white transition ${
              loading || !message.trim()
                ? "bg-blue-400 cursor-not-allowed opacity-70"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <Send size={17} className="animate-pulse" />
            ) : (
              <>
                {mode === "log" ? <Sparkles size={17} /> : <Wand2 size={17} />}
                <span className="mt-1">{mode === "log" ? "Log" : "Edit"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
