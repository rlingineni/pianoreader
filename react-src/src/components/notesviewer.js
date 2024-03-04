import { detect } from "@tonaljs/chord-detect";
import { useState } from "react";

// create random array of pressed octaves and notes

const validNotes = ["A", "B", "C", "D", "E", "F", "G"];

function getOctaveGroups(notes) {
  const octaveGroups = {};
  for (const note of notes) {
    const octave = note[note.length - 1];
    // add to the right posiiton
    const index = validNotes.indexOf(note.slice(0, -1));
    if (!octaveGroups[octave]) {
      // make empty array of 7 elements
      octaveGroups[octave] = new Array(7).fill("  ");
      octaveGroups[octave][index] = note;
    } else {
      octaveGroups[octave][index] = note;
    }
  }
  return octaveGroups;
}

// add octave groups 1->8
function addBlankOctaveGroups(octaveGroups) {
  for (let i = 1; i <= 8; i++) {
    if (!octaveGroups[i]) {
      octaveGroups[i] = new Array(7).fill("  ");
    }
  }
  return octaveGroups;
}

const history = [];

export const NotesViewer = ({ onChordDetected, notes }) => {
  const octaveGroups = addBlankOctaveGroups(getOctaveGroups(notes));
  let [detectedChord, setDetectedChord] = useState("");

  const flat = [];
  for (const key of Object.keys(octaveGroups)) {
    flat.push(octaveGroups[key]);
  }

  let value = "";
  const spacing = "|";
  for (let i = 0; i < Object.keys(octaveGroups).length; i++) {
    // look at all the notes
    value += flat[i].join("");

    if (i !== octaveGroups.length - 1) {
      value += spacing;
    }
  }

  const chord = detect([flat[0], flat[1], flat[2], flat[3]].flat());
  if (chord) {
    onChordDetected(chord);
    detectedChord = chord;
  }

  history.push(
    (detectedChord ? detectedChord.toString() : " ").padEnd(20) +
      spacing +
      value +
      "\n"
  );
  const txtArea = document.getElementById("historyView");
  if (txtArea) {
    txtArea.scrollTop = txtArea.scrollHeight + 10;
  }


  return (
    <div className="w-full">
      <button className="underline" onClick={()=>{
        history.length = 0;
        if(txtArea){
          txtArea.value = "";
        }
      }}>clear</button>
      <textarea
        id="historyView"
        rows="20" 
        className="font-mono w-full border border-gray-200 rounded-md mb-10 text-xs"
        readOnly
        value={history.join("")}
      />
    </div>
  );
};
