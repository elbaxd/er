"use client";
import { ReactNode, useState } from "react";
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
  // Contenido inicial del editor (esqueleto base) y si debe persistir
  // en localStorage. Ver CodeEditor.tsx para el detalle.
  initialContent?: string;
  persistToLocalStorage?: boolean;
  // Igual que persistToLocalStorage, pero para el diagrama (posiciones,
  // nodos guardados por ReactFlow). Ver ErDiagram.tsx para el detalle.
  persistDiagram?: boolean;
  // Contenido a insertar ARRIBA del editor, dentro de la misma columna
  // (ej. el enunciado + botón "Validar" en el módulo de práctica). Si
  // no se pasa, el panel izquierdo queda igual que siempre.
  leftPanelHeader?: ReactNode;
};

const Body = ({
  erDoc,
  lastChange,
  onErDocChange,
  onErrorMessagesChange,
  hideErrorsPanel,
  hideExamplesPanel,
  initialContent,
  persistToLocalStorage,
  persistDiagram,
  leftPanelHeader,
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
          {leftPanelHeader}
          <div className="min-h-0 flex-1">
            <CodeEditor
              onErDocChange={onErDocChange}
              onErrorChange={setErDocHasError}
              onErrorMessagesChange={onErrorMessagesChange}
              hideErrorsPanel={hideErrorsPanel}
              hideExamplesPanel={hideExamplesPanel}
              initialContent={initialContent}
              persistToLocalStorage={persistToLocalStorage}
            />
          </div>
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
            persistDiagram={persistDiagram}
          />
        </div>
      </Panel>
    </PanelGroup>
  );
};

export default Body;
