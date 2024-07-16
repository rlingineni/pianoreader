import { useCallback, useEffect, useState } from "react";

// const cx = (val) => {
//     className={cx("px-2 py-1 text-sm", {
//         "bg-gray-100": idx % 2,
//       })}

//
// };

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
  1: {
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

function KeyFrameEditor() {
  const [selectedElements, setSelectedElements] = useState([]);

  const toggleSelectedElements = (el, event) => {
    if (selectedElements.includes(el)) {
      setSelectedElements((els) => els.filter((str) => str !== el));
      return;
    }

    if (event.ctrlKey) {
      setSelectedElements((els) => els.concat([el]));
    } else {
      setSelectedElements([el]);
    }

    // if the ctrl key is held down, add to array

    // if the selectedElement already exists, remove
  };

  const getSubProperties = (el) => {
    const properties = {};

    const times = Object.keys(KeyFrameData);
    for (const time in times) {
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

  const Timeline = ({ events }) => {
    return (
      <div className="relative h-1 bg-red-200 rounded-md w-full">
        {events.map((e) => (
          <div
            className="absolute w-1 h-1 bg-red-500"
            style={{ left: e.time / 100 }}
          />
        ))}
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
      <div className="flex border-bottom border-gray-200 mb-1 gap-2">
        <div className="bg-gray-200 px-2 py-.5 text-sm border-b-2 border-gray-500 w-32  flex items-center">
          Entry Scene
        </div>
        <div className="bg-gray-100 px-2 py-.5 text-md flex justify-center items-center rounded-md">
          +
        </div>
      </div>

      <div className="flex w-full h-full">
        <div className="pr-6 bg-gray-100">
          <div className="h-6 bg-gray-200 w-full" />
          {UniqueElements.map((el, idx) => (
            <div>
              <div
                className="px-2 py-1.5 text-sm"
                key={el}
                onClick={(e) => {
                  toggleSelectedElements(el, e);
                }}
              >
                {el}
                {selectedElements.includes(el) &&
                  Object.keys(getSubProperties(el)).map((key) => (
                    <div className="mt-3 pl-2 text-xs">{key}</div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <div className="w-3/4 bg-gray-400">
          <div className="h-6 bg-gray-200"> </div>
          {UniqueElements.map((el, idx) => (
            <div className="w-full">
              <div className="px-2 py-1.5">
                <span class="flex items-center w-full text-sm">
                  &nbsp;
                  <div className="h-2 bg-red-200 rounded-md w-full" />
                </span>
                {/* {selectedElements.includes(el) && {}
                 Object.keys(getSubProperties(el)).map((key) => (
                    <div className="mt-3 text-sm">
                      <Timeline events={getSubProperties(el)} />
                    </div>
                  ))} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KeyFrameEditor;
