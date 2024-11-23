import { useCallback, useEffect, useState } from "react";

/**
 * Main TO:DO
 * - Have toggle-able HTML/CSS Editor
 * - HTML, every element id or class prefixed with a 'ani-', will show up in Unique items
 * - CSS is read and items KeyFrameData const is populated with initial CSS Data
 * - Future: CSS is generated with keyframe at point X on Double Click
 * -
 *
 *
 */

const KeyFrameData = {
  0: {
    "Button Group": {
      opacity: 0,
    },
    "Button Group 2": {
      opacity: 3,
    },
    "Button Group 3": {
      opacity: 4,
      translateX: 0,
    },
  },
  15: {
    "Button Group 1": {
      opacity: 3,
    },
    "Button Group 3": {
      translateX: 1,
    },
  },
  25: {
    "Button Group": {
      opacity: 5,
    },
    "Button Group 2": {
      opacity: 1,
    },
    "Button Group 3": {
      opacity: 3,
    },
  },
  45: {
    "Button Group 1": {
      opacity: 5,
    },
  },
  100: {
    "Button Group": {
      opacity: 1,
    },
    "Button Group 3": {
      opacity: 2,
      translateX: 20,
    },
  },
};

const UniqueElements = [
  "Button Group",
  "Button Group 1",
  "Button Group 2",
  "Button Group 3",
];

function cx(str, obj) {
  let className = str;

  for (const key in obj) {
    if (!!obj[key]) {
      className = className + " " + key;
    }
  }

  return className;
}

function KeyFrameEditor() {
  const [selectedElements, setSelectedElements] = useState([]);

  const toggleSelectedElements = (el, event) => {
    if (selectedElements.includes(el)) {
      setSelectedElements((els) => els.filter((str) => str !== el));
      return;
    }

    if (event.ctrlKey) {
      setSelectedElements([el]);
    } else {
      setSelectedElements((els) => els.concat([el]));
    }

    // if the ctrl key is held down, add to array

    // if the selectedElement already exists, remove
  };

  const getSubProperties = (el) => {
    const properties = {};

    const times = Object.keys(KeyFrameData);
    for (const time of times) {
      if (KeyFrameData[time][el]) {
        for (const key of Object.keys(KeyFrameData[time][el])) {
          if (!properties[key]) {
            properties[key] = [{ time, value: KeyFrameData[time][el][key] }];
          } else {
            properties[key].push([
              { time, value: KeyFrameData[time][el][key] },
            ]);
          }
        }
      }
    }

    return properties;
  };

  const filterKeyFrameData = (el, propertiesToFilter) => {
    const filteredSet = {};
    const times = Object.keys(KeyFrameData);
    for (const time of times) {
      if (KeyFrameData[time][el]) {
        if (!filteredSet[time]) {
          filteredSet[time] = { [el]: {} };
        }
        const animatedProperties = Object.keys(KeyFrameData[time][el]);
        if (propertiesToFilter && propertiesToFilter.length > 0) {
          let exists = false;
          for (const property of propertiesToFilter) {
            if (animatedProperties.includes(property)) {
              filteredSet[time][el][property] =
                KeyFrameData[time][el][property];
              exists = true;
            }
          }

          if (!exists) {
            delete filteredSet[time][el];
            delete filteredSet[time];
          }
        } else {
          filteredSet[time][el] = KeyFrameData[time][el];
        }
      }
    }

    return filteredSet;
  };

  /**
   * Renders a timeline
   * To-DO: Add Event Click Handlers for each keyframe
   * @returns
   */
  const Timeline = ({ el, properties, selected, subTimeline, dim }) => {
    const timeStamps = Object.keys(filterKeyFrameData(el, properties));
    return (
      <div
        className={cx("relative h-1 rounded-md w-full", {
          "bg-red-200": !subTimeline,
          "bg-blue-200": subTimeline,
          "opacity-40": dim,
        })}
      >
        {timeStamps.map((e) => (
          <div
            className="absolute w-1 h-1 bg-red-500"
            style={{ left: `${e}%` }}
          />
        ))}
      </div>
    );
  };

  /**
   * Draws a playhead
   * To-Do: Pass Percent Moved on OnMove funciton, and then pass it in the state again to abs. position
   * @param {Draws} percent
   * @returns
   */
  const PlayHead = (percent) => {
    return (
      <div
        className="absolute w-1 h-72 bg-green-500 relative"
        style={{ left: `${10}%` }}
      >
        <div className="absolute bg-green-500 w-3 h-2 top-0 -left-1 rounded-full" />
      </div>
    );
  };

  // const RenderTimeLines(el) => {
  //   return (
  //   Object.keys(getSubProperties(el)).map((key) => (
  //       <div className="mt-3 text-sm">
  //         <Timeline events={getSubProperties(el)} />
  //       </div>
  //     ))}
  //     )
  // }

  return (
    <div className="w-full h-full">
      <div className="h-72 w-full bg-gray-200 mb-4">CANVAS</div>

      <div className="w-full flex justify-between mb-1">
        <div className="flex border-bottom border-gray-200 gap-2">
          <div className="bg-gray-200 px-2 py-.5 text-sm border-b-2 border-gray-500 w-32  flex items-center">
            Entry Scene
          </div>
          <div className="bg-gray-100 px-2 py-.5 text-md flex justify-center items-center rounded-md">
            +
          </div>
        </div>
        <div className="bg-blue-200 px-2 py-.5">Play</div>
      </div>

      <div className="flex w-full h-full">
        <div className="w-48 bg-gray-100">
          <div className="h-6 bg-gray-200 w-full" />
          {UniqueElements.map((el, idx) => (
            <div>
              <div className="px-1 py-1.5 text-xs" key={el}>
                <div
                  className="font-bold"
                  onClick={(e) => {
                    toggleSelectedElements(el, e);
                  }}
                >
                  {el}
                </div>
                {selectedElements.includes(el) &&
                  Object.keys(getSubProperties(el)).map((key) => (
                    <div className="mt-3 pl-2 text-xs">{key}</div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-400">
          <div className="h-2 bg-gray-200">
            <div className="mx-2 bg-green-200 h-2 relative">
              <PlayHead />
            </div>
          </div>
          {UniqueElements.map((el, idx) => (
            <div className="px-2 w-full" style={{ marginTop: "2px" }}>
             <span className="pl-2">
             <Timeline el={el} dim={selectedElements.includes(el)}/> 
              </span>
              {selectedElements.includes(el) &&
                Object.keys(getSubProperties(el)).map((key) => (
                  <span className="mt-3 pl-2">
                    <Timeline el={el} properties={[key]} subTimeline={true} />
                  </span>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KeyFrameEditor;
