import KeyFrameEditor from "./components/KeyFrameEditor";
import "./tailwind.css";

function BlankPage() {
  return (
    <div className="px-12 h-full py-4">
      <div className="w-3/4 h-72">
        <KeyFrameEditor />
      </div>
    </div>
  );
}

export default BlankPage;
