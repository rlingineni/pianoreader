import { detect } from "@tonaljs/chord-detect";

// create random array of pressed octaves and notes

// get combinations of 4 notes max +1 -1 of an octave group
function getOctaveGroups(notes) {
  const octaveGroups = {};
  for (const note of notes) {
    const octave = note[note.length - 1];
    if (!octaveGroups[octave]) {
      octaveGroups[octave] = [note];
    } else {
      octaveGroups[octave].push(note);
    }
  }
  return octaveGroups;
}

export const NotesViewer = ({ onChordDetected, notes }) => {
  const octaveGroups = getOctaveGroups(notes);

  const flat = [];
  for (const key of Object.keys(octaveGroups)) {
    flat.push(octaveGroups[key]);
  }

  let value = "";
  const spacing = "                                  ";
  for (let i = 0; i < Object.keys(octaveGroups).length; i++) {
    value += flat[i].join(" ");

    if (i !== octaveGroups.length - 1) {
      value += spacing;
    }
  }

  const getNotes = () => {
    const input = document.getElementById("notesInput");
    const selection = input.value.substring(
      input.selectionStart,
      input.selectionEnd
    );

    // strip out spaces in between
    const notes = selection.split(" ");

    const validNotes = ["A", "B", "C", "D", "E", "F", "G"];

    // remove empty strings
    const filteredNotes = notes.filter(
      (note) => note !== "" && validNotes.includes(note.slice(0, -1))
    );

    // get the chord
    console.log(filteredNotes);
    const chord = detect(filteredNotes);
    console.log(chord);
    onChordDetected(chord);
  };

  return (
    <input
      id="notesInput"
      onBlur={() => onChordDetected("")}
      className="font-bold w-1/2 text-center"
      readOnly
      onSelect={getNotes}
      value={value}
    />
  );
};
