"use client";
import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ER } from "../../ERDoc/types/parser/ER";
import useWindowDimensions from "../hooks/useWindowDimensions";
import { DiagramChange, ErDocChangeEvent, ErrorMessage } from "../types/CodeEditor";
import CodeEditor from "./CodeEditor/CodeEditor";
import { ErDiagram } from "./ErDiagram/ErDiagram";

type BodyProps = {
  erDoc: ER | null;
  onErDocChange: (evt: ErDocChangeEvent) => void;
  lastChange: DiagramChange | null;
  // Props opcionales para el módulo de práctica: exponer los errores
  // completos hacia el padre y ocultar los paneles fijos de Errors/
  // Examples debajo del editor. Si no se pasan, el comportamiento es
  // idéntico al editor principal.
  onErrorMessagesChange?: (errors: ErrorMessage[]) => void;
  hideErrorsPanel?: boolean;
  hideExamplesPanel?: boolean;
};

const Body = ({
  erDoc,
  lastChange,
  onErDocChange,
  onErrorMessagesChange,
  hideErrorsPanel,
  hideExamplesPanel,
}: BodyProps) => {
  const [erDocHasError, setErDocHasError] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const { width } = useWindowDimensions();
  const lg = (width ?? Infinity) >= 1024;

  return (
    <PanelGroup direction={lg ? "horizontal" : "vertical"}>
      <Panel defaultSize={40} minSize={25}>
        <div
          className={`flex h-full w-full flex-col  ${
            lg ? "overflow-hidden" : ""
          }`}
        >
          <CodeEditor
            onErDocChange={onErDocChange}
            onErrorChange={setErDocHasError}
            onErrorMessagesChange={onErrorMessagesChange}
            hideErrorsPanel={hideErrorsPanel}
            hideExamplesPanel={hideExamplesPanel}
          />
        </div>
      </Panel>

      <PanelResizeHandle
        className={`relative w-1 ${dragging ? "bg-secondary" : "bg-primary"}`}
        onDragging={(isDragging) => {
          setDragging(isDragging);
        }}
      >
        <div className="h-full w-1 bg-primary hover:bg-secondary"></div>
      </PanelResizeHandle>

      <Panel defaultSize={60} className={`${!lg ? "float-left" : ""}`}>
        <div className="h-full pt-1">
          <ErDiagram
            erDoc={erDoc!}
            erDocHasError={erDocHasError}
            lastChange={lastChange}
          />
        </div>
      </Panel>
    </PanelGroup>
  );
};

export default Body;
