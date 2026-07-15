import InteractionForm from "../components/ui/interaction/InteractionForm";
import AIChat from "../components/ui/interaction/AIChat";

// InteractionForm and AIChat both read/write the shared `interaction` Redux
// slice directly (via useSelector/useDispatch), so this page doesn't need to
// pass any state down as props.
export default function LogInteraction() {
  return (
    <div className="grid h-[calc(100vh-110px)] grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.75fr)_380px]">
      <div className="min-h-0 overflow-y-auto pr-1">
        <InteractionForm />
      </div>

      <div className="min-h-[520px] xl:min-h-0 xl:sticky xl:top-6">
        <AIChat />
      </div>
    </div>
  );
}
