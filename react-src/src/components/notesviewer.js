import { detect } from "@tonaljs/chord-detect";
import { ScrollSync, ScrollSyncPane } from "react-scroll-sync";

import { useState, useEffect, useRef } from "react";

// create random array of pressed octaves and notes

const validNotes = ["C", "D", "E", "F", "G", "A", "B"];

// convert seconds to MM:SS
const minuteSeconds = (currentTime) =>
  new Date(currentTime * 1000).toISOString().substr(11, 8);

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

export const NotesViewer = ({ notes, videoId, onTimeClick }) => {
  const [history, setHistory] = useState([]);
  const [dedupeEnabled] = useState(false);
  const [savedNotes, setSavedNotes] = useState([]);

  const videoRef = useRef(document.getElementById(videoId));

  useEffect(() => {
    const videoEl = videoRef.current;
    const flat = [];
    const octaveGroups = addBlankOctaveGroups(getOctaveGroups(notes));
    let detectedChord = "";
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
      detectedChord = chord;
    }
    const row = [
      (detectedChord ? detectedChord.toString() : " ").padEnd(20) +
        spacing +
        value +
        "\n",
    ];

    // Sort notes starting at C -> G
    if (dedupeEnabled && history[0].row === row) {
      // skip entry
    } else {
      setHistory((h) => [{ row, time: videoEl.currentTime }].concat(h));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, videoRef, dedupeEnabled]);

  // remove duplicate rows that are next to each other
  const dedupeRows = (rows) => {
    const deduped = [];
    for (let i = 0; i < rows.length; i++) {
      if (i === 0) {
        deduped.push(rows[i]);
      } else {
        if (rows[i].row !== rows[i - 1].row) {
          deduped.push(rows[i]);
        }
      }
    }
    return deduped;
  };

  const rowData = dedupeEnabled ? dedupeRows(history) : history;

  const lines = rowData.map((r) => r.row).join("");

  return (
    <ScrollSync>
      <div className="w-full">
        <div className="flex gap-6 mb-2">
          {/* <div className="flex items-center">
            <input
              type="checkbox"
              onChange={(e) => {
                setDedupeEnabled(e.target.checked);
              }}
            />
            <label className="ml-2">de-dupe</label>
          </div> */}
          <button
            className="underline"
            onClick={() => {
              setHistory([]);
            }}
          >
            clear
          </button>
          <div className="flex gap-1">
            {savedNotes.map((r, idx) => (
              <button
                className="flex items-center bg-gray-200 rounded-md px-2 py-1"
                onClick={() => {
                  // when clicked remove from saved notes
                  setSavedNotes((s) => s.filter((_, i) => i !== idx));
                }}
              >
                <p className="text-xs font-mono">
                  {r.row[0].split("|")[0].trim()}
                </p>
              </button>
            ))}
          </div>
        </div>
        <div
          className="flex border border-gray-200 rounded-md"
          style={{ height: "300px" }}
        >
          <ScrollSyncPane>
            <div
              className="px-4 py-2 bg-gray-200 rounded-l-md overflow-y-auto mr-1"
              style={{ height: "300px" }}
            >
              {rowData.map((r) => (
                <p
                  className="text-xs font-mono"
                  role="button"
                  onClick={() => {
                    // when clicked on a row, jump to that time
                    if (videoRef.current) {
                      videoRef.current.currentTime = r.time - 2;
                      // remove the history after the row time
                      setHistory((h) => h.filter((x) => x.time + 2 < r.time));
                      if (videoRef.current.paused) {
                        videoRef.current.play();
                        // play for 3s
                        // setTimeout(() => {
                        //   videoRef.current.pause();
                        // }, 3000);

                        setSavedNotes((s) => [...s, r]);
                      }
                    }
                  }}
                >
                  {minuteSeconds(r.time)}
                </p>
              ))}
            </div>
          </ScrollSyncPane>
          <ScrollSyncPane>
            <textarea
              id="historyView"
              className="font-mono w-full h-full mb-10 py-2 text-xs rounded-r-md"
              readOnly
              value={lines}
            />
          </ScrollSyncPane>
        </div>
      </div>
    </ScrollSync>
  );
};
