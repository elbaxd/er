import { ER } from "../../ERDoc/types/parser/ER";
import { Relationship } from "../../ERDoc/types/parser/Relationship";

export type LevelId = 1 | 2 | 3 | 4 | 5 | 6;
export type SubLevelId = 1 | 2;

// --- Forma de la "respuesta esperada" de un ejercicio ---
//
// - "structural" (enunciado abstracto): no exige nombres, solo
//   cantidades (atributos, keys, y para relaciones: cardinalidades y
//   cantidad de atributos propios).
// - "exact" (enunciado directo): exige nombres específicos, porque el
//   enunciado los da explícitamente ("la entidad Usuario", "rut"...).

// ---------- Modo "exact" ----------

export type ExpectedAttributeExact = {
  name: string;
  isKey: boolean;
};

export type ExpectedEntityExact = {
  name: string;
  // Si se omite, no se exige un set específico de atributos (solo que
  // la entidad exista). Útil para entidades que el enunciado da como
  // "predefinidas" sin detallar su estructura (ej. Curso, Estudiante).
  attributes?: ExpectedAttributeExact[];
  // Si es true, se exige que la entidad esté marcada como débil
  // (hasDependencies) y que dependa de alguna relación.
  isWeak?: boolean;
};

export type ExpectedParticipantExact = {
  entityName: string;
  // Si se omite, no se exige una cardinalidad específica para ese
  // participante (solo que la entidad participe en la relación).
  cardinality?: string;
  participation?: "total" | "partial";
};

export type ExpectedRelationshipExact = {
  // Si se omite, se busca CUALQUIER relación del diagrama que cumpla
  // con los participantes pedidos (útil cuando el enunciado no exige
  // un nombre específico, como en la relación de dependencia del
  // nivel 4).
  name?: string;
  participants: ExpectedParticipantExact[];
  // Nombres de atributos propios que la relación debe tener.
  attributes?: string[];
};

export type ExpectedAnswerExact = {
  mode: "exact";
  entities: ExpectedEntityExact[];
  relationships?: ExpectedRelationshipExact[];
};

// ---------- Modo "structural" ----------

export type ExpectedEntityShape = {
  label: string; // solo para mensajes de feedback, no se compara
  attributeCount: number;
  keyAttributeCount: number;
  isWeak?: boolean; // default false
};

export type ExpectedRelationshipShape = {
  label: string; // solo para mensajes de feedback, no se compara
  // Multiset de cardinalidades de los participantes, ej. ["1", "N"].
  cardinalities: string[];
  // Cantidad de atributos propios que debe tener la relación.
  attributeCount: number;
};

export type ExpectedAnswerStructural = {
  mode: "structural";
  entities: ExpectedEntityShape[];
  relationships?: ExpectedRelationshipShape[];
};

export type ExpectedAnswer = ExpectedAnswerExact | ExpectedAnswerStructural;

export type ExerciseDefinition = {
  statement: string;
  expected: ExpectedAnswer;
};

// --- Formas reutilizadas (modo structural) ---

const shape = (
  label: string,
  attributeCount: number,
  keyAttributeCount: number,
  isWeak: boolean = false,
): ExpectedEntityShape => ({ label, attributeCount, keyAttributeCount, isWeak });

const LIBRO_SHAPE = shape("Libro", 3, 1); // ISBN, Titulo, Ano
const AUTOR_SHAPE = shape("Autor", 3, 1); // RUT, Nombre, Nacionalidad
const SOCIO_SHAPE = shape("Socio", 3, 1); // RUT, Nombre, Telefono
const EJEMPLAR_SHAPE = shape("Ejemplar (entidad débil)", 2, 1, true); // numero_copia (pkey), estado_conservacion

// --- Entidades exactas reutilizadas (modo exact) ---

const USUARIO_EXACT: ExpectedEntityExact = {
  name: "Usuario",
  attributes: [
    { name: "rut", isKey: true },
    { name: "nombre", isKey: false },
    { name: "email", isKey: false },
  ],
};

const PRODUCTO_EXACT: ExpectedEntityExact = {
  name: "Producto",
  attributes: [
    { name: "codigo", isKey: true },
    { name: "nombre_producto", isKey: false },
    { name: "precio", isKey: false },
  ],
};

// Entidades "predefinidas" por el enunciado, sin atributos exigidos.
const CURSO_EXACT: ExpectedEntityExact = { name: "Curso" };
const ESTUDIANTE_EXACT: ExpectedEntityExact = { name: "Estudiante" };
const CLIENTE_EXACT: ExpectedEntityExact = { name: "Cliente" };
const FACTURA_EXACT: ExpectedEntityExact = { name: "Factura" };
const EDIFICIO_EXACT: ExpectedEntityExact = { name: "Edificio" };

const HABITACION_EXACT: ExpectedEntityExact = {
  name: "Habitacion",
  isWeak: true,
  attributes: [
    // Asumimos que un atributo pkey también se marca con isKey=true en
    // el AST (no encontramos un campo separado para "llave parcial" en
    // EntityAttribute). Ajustar si el parser real lo representa distinto.
    { name: "numero_habitacion", isKey: true },
    { name: "capacidad", isKey: false },
  ],
};

// --- Enunciados y respuesta esperada por nivel/subnivel ---

export const EXERCISES: Partial<
  Record<LevelId, Partial<Record<SubLevelId, ExerciseDefinition>>>
> = {
  1: {
    1: {
      statement:
        "Una biblioteca comunitaria necesita digitalizar su inventario. Desean guardar el registro de cada uno de los libros que poseen, distinguiéndolos por su código ISBN único, su título y su año de publicación. Adicionalmente, quieren tener la información de los autores, identificados de forma única por su RUT, registrando también su nombre y nacionalidad. Por ahora, no se requiere modelar la relación entre ambos, solo registrar ambas partes por separado.",
      expected: {
        mode: "structural",
        entities: [LIBRO_SHAPE, AUTOR_SHAPE],
      },
    },
    2: {
      statement:
        "Bienvenido a ERdoc! En este nivel aprenderás a definir Entidades (los objetos del mundo real) y sus Atributos (sus propiedades). Para declarar una entidad en ERdoc se utiliza el bloque entity Nombre{ ... }. Cada objeto necesita un atributo identificador único llamado Llave Primaria, la cual se especifica anteponiendo la palabra key. Tu desafío: Crea dos entidades aisladas: Una entidad Usuario que contenga el atributo rut (marcado con key), además de los atributos nombre y email. Una entidad Producto que contenga el atributo codigo (marcado con key), además de los atributos nombre_producto y precio.",
      expected: {
        mode: "exact",
        entities: [USUARIO_EXACT, PRODUCTO_EXACT],
      },
    },
  },
  2: {
    1: {
      statement:
        "Continuando con la digitalización de la biblioteca, ahora se requiere vincular los libros con sus respectivos autores. En el sistema, cada libro pertenece a un único autor registrado. Por otro lado, un autor puede haber escrito uno o varios libros que forman parte de la biblioteca. Modela la relación entre las entidades de forma que reflejen la autoría de cada obra.",
      expected: {
        mode: "structural",
        entities: [LIBRO_SHAPE, AUTOR_SHAPE],
        relationships: [
          {
            label: "Autoría (Autor–Libro)",
            cardinalities: ["1", "N"], // Autor:1, Libro:N
            attributeCount: 0,
          },
        ],
      },
    },
    2: {
      statement:
        "Nuevo concepto: Relaciones y Cardinalidades. Las entidades se conectan entre sí mediante Relaciones usando la sintaxis relation Nombre{Entidad1(cardinalidad), Entidad2(cardinalidad)}. Las cardinalidades definen cuántas instancias se asocian entre sí. En una relación 1:N (Uno a Muchos), un elemento de un lado se relaciona con un único elemento del otro, mientras que este último puede asociarse con varios. Tu desafío: Tienes predefinidas las entidades Curso y Estudiante. Crea una relación llamada Inscribe que conecte a ambas entidades, definiendo la cardinalidad adecuada para indicar que un curso puede tener muchos estudiantes (N), pero cada estudiante pertenece a un único curso (1).",
      expected: {
        mode: "exact",
        entities: [CURSO_EXACT, ESTUDIANTE_EXACT],
        relationships: [
          {
            name: "Inscribe",
            participants: [
              { entityName: "Curso", cardinality: "1" },
              { entityName: "Estudiante", cardinality: "N" },
            ],
          },
        ],
      },
    },
  },
  3: {
    1: {
      statement:
        "Para gestionar el préstamo de libros, la biblioteca registrará a sus socios (identificados por su RUT único, con su nombre y teléfono). Un socio puede solicitar prestados varios libros a lo largo del tiempo, y un mismo libro puede ser pedido por distintos socios. Además, para mantener un control adecuado del servicio, es necesario registrar la fecha exacta en la que se realiza cada préstamo.",
      expected: {
        mode: "structural",
        entities: [LIBRO_SHAPE, SOCIO_SHAPE],
        relationships: [
          {
            label: "Préstamo (Socio–Libro)",
            cardinalities: ["N", "M"],
            attributeCount: 1, // fecha del préstamo
          },
        ],
      },
    },
    2: {
      statement:
        "Nuevo concepto: Relaciones N:M y Atributos Propios. Una relación N:M (Muchos a Muchos) ocurre cuando elementos de ambos lados pueden conectarse con múltiples elementos del otro lado. Las relaciones también pueden guardar atributos propios. Estos se escriben entre llaves dentro del mismo bloque de la relación, igual que en una entidad. Tu desafío: Tienes las entidades Cliente y Factura. Crea una relación llamada Compra de tipo N:M entre ambas. Además, agrega dentro de la relación Compra un atributo propio llamado fecha_compra.",
      expected: {
        mode: "exact",
        entities: [CLIENTE_EXACT, FACTURA_EXACT],
        relationships: [
          {
            name: "Compra",
            participants: [
              { entityName: "Cliente", cardinality: "N" },
              { entityName: "Factura", cardinality: "M" },
            ],
            attributes: ["fecha_compra"],
          },
        ],
      },
    },
  },
  4: {
    1: {
      statement:
        "La biblioteca cuenta con varias copias o ejemplares físicos de cada libro. Un ejemplar no posee un identificador único global en la biblioteca; en su lugar, se identifica únicamente dentro del contexto del libro al que pertenece mediante un número de copia (llave parcial) y su estado de conservación. Si un libro se elimina del sistema, sus ejemplares físicos también dejan de existir. Modela la entidad débil de los ejemplares y su relación de dependencia con el libro.",
      expected: {
        mode: "structural",
        entities: [LIBRO_SHAPE, EJEMPLAR_SHAPE],
        relationships: [
          {
            label: "Dependencia (Ejemplar–Libro)",
            cardinalities: ["1", "N"], // Ejemplar:1 (participación total), Libro:N
            attributeCount: 0,
          },
        ],
      },
    },
    2: {
      statement:
        "Nuevo concepto: Entidades Débiles. Una entidad débil es aquella que no puede identificarse por sí misma y depende de una entidad fuerte para existir. Su atributo identificador no es global, sino local, y se define como Llave Parcial usando pkey. La dependencia de existencia se declara mediante la instrucción DEPENDS ON indicando la entidad fuerte de la cual depende. Tu desafío: Tienes la entidad fuerte Edificio. Crea una entidad débil llamada Habitacion que tenga una llave parcial numero_habitacion (usando pkey) y un atributo capacidad. Finalmente, establece la relación de dependencia para que Habitacion dependa de Edificio (DEPENDS ON Edificio).",
      expected: {
        mode: "exact",
        entities: [EDIFICIO_EXACT, HABITACION_EXACT],
        relationships: [
          {
            // Sin nombre: el enunciado no exige un nombre específico
            // para la relación de dependencia, solo que exista una
            // que conecte Habitacion (participación total, cardinalidad
            // 1) con Edificio.
            participants: [
              {
                entityName: "Habitacion",
                cardinality: "1",
                participation: "total",
              },
              { entityName: "Edificio" },
            ],
          },
        ],
      },
    },
  },
};

export const getExercise = (
  level: LevelId,
  subLevel: SubLevelId,
): ExerciseDefinition | undefined => EXERCISES[level]?.[subLevel];

// --- Validación ---

export type ValidationResult = {
  correct: boolean;
  missing: string[];
};

export const validateAnswer = (
  erDoc: ER | null,
  expected: ExpectedAnswer,
): ValidationResult => {
  if (!erDoc || erDoc.entities.length === 0) {
    return {
      correct: false,
      missing: ["Aún no has definido ninguna entidad en el editor."],
    };
  }

  const missing =
    expected.mode === "exact"
      ? validateExact(erDoc, expected)
      : validateStructural(erDoc, expected);

  return { correct: missing.length === 0, missing };
};

// --- Modo "exact": compara nombres tal como los pide el enunciado ---

const relationshipHasParticipant = (
  relationship: Relationship,
  expectedParticipant: ExpectedParticipantExact,
): boolean => {
  const actualPart = relationship.participantEntities.find(
    (p) =>
      p.entityName.toLowerCase() ===
      expectedParticipant.entityName.toLowerCase(),
  );

  if (!actualPart) return false;
  if (actualPart.isComposite) {
    // No validamos participantes compuestos en detalle por ahora.
    return true;
  }
  if (
    expectedParticipant.cardinality !== undefined &&
    actualPart.cardinality !== expectedParticipant.cardinality
  ) {
    return false;
  }
  if (
    expectedParticipant.participation !== undefined &&
    actualPart.participation !== expectedParticipant.participation
  ) {
    return false;
  }
  return true;
};

const relationshipMatches = (
  relationship: Relationship,
  expectedRel: ExpectedRelationshipExact,
): boolean =>
  expectedRel.participants.every((p) =>
    relationshipHasParticipant(relationship, p),
  );

const describeExpectedRelationship = (
  expectedRel: ExpectedRelationshipExact,
): string => {
  const parts = expectedRel.participants
    .map(
      (p) =>
        `${p.entityName}${p.cardinality ? ` (${p.cardinality})` : ""}${
          p.participation ? ` [${p.participation}]` : ""
        }`,
    )
    .join(", ");
  return expectedRel.name ? `"${expectedRel.name}" (${parts})` : `(${parts})`;
};

const validateExact = (
  erDoc: ER,
  expected: ExpectedAnswerExact,
): string[] => {
  const missing: string[] = [];

  const actualEntitiesByName = new Map(
    erDoc.entities.map((entity) => [entity.name.toLowerCase(), entity]),
  );

  for (const expectedEntity of expected.entities) {
    const actualEntity = actualEntitiesByName.get(
      expectedEntity.name.toLowerCase(),
    );

    if (!actualEntity) {
      missing.push(`Falta la entidad "${expectedEntity.name}".`);
      continue;
    }

    if (expectedEntity.isWeak && !actualEntity.hasDependencies) {
      missing.push(
        `La entidad "${expectedEntity.name}" debería ser una entidad débil (usar DEPENDS ON).`,
      );
    }

    if (expectedEntity.attributes) {
      const actualAttrsByName = new Map(
        actualEntity.attributes.map((attr) => [
          attr.name.toLowerCase(),
          attr,
        ]),
      );

      for (const expectedAttr of expectedEntity.attributes) {
        const actualAttr = actualAttrsByName.get(
          expectedAttr.name.toLowerCase(),
        );

        if (!actualAttr) {
          missing.push(
            `A la entidad "${expectedEntity.name}" le falta el atributo "${expectedAttr.name}".`,
          );
          continue;
        }

        if (expectedAttr.isKey && !actualAttr.isKey) {
          missing.push(
            `El atributo "${expectedAttr.name}" de "${expectedEntity.name}" debería estar marcado como llave (key/pkey).`,
          );
        }
      }

      const expectedAttrNames = new Set(
        expectedEntity.attributes.map((a) => a.name.toLowerCase()),
      );
      const extraAttrs = actualEntity.attributes.filter(
        (a) => !expectedAttrNames.has(a.name.toLowerCase()),
      );
      if (extraAttrs.length > 0) {
        missing.push(
          `La entidad "${expectedEntity.name}" tiene atributo(s) que no pide el enunciado: ${extraAttrs
            .map((a) => a.name)
            .join(", ")}.`,
        );
      }
    }
  }

  const expectedEntityNames = new Set(
    expected.entities.map((e) => e.name.toLowerCase()),
  );
  const extraEntities = erDoc.entities.filter(
    (e) => !expectedEntityNames.has(e.name.toLowerCase()),
  );
  if (extraEntities.length > 0) {
    missing.push(
      `Hay entidad(es) que no pide el enunciado: ${extraEntities
        .map((e) => e.name)
        .join(", ")}.`,
    );
  }

  for (const expectedRel of expected.relationships ?? []) {
    const candidates = expectedRel.name
      ? erDoc.relationships.filter(
          (r) => r.name.toLowerCase() === expectedRel.name!.toLowerCase(),
        )
      : erDoc.relationships;

    const match = candidates.find((r) => relationshipMatches(r, expectedRel));

    if (!match) {
      missing.push(
        `Falta una relación ${describeExpectedRelationship(expectedRel)}.`,
      );
      continue;
    }

    if (expectedRel.attributes) {
      const actualAttrNames = new Set(
        match.attributes.map((a) => a.name.toLowerCase()),
      );
      const missingAttrs = expectedRel.attributes.filter(
        (name) => !actualAttrNames.has(name.toLowerCase()),
      );
      if (missingAttrs.length > 0) {
        missing.push(
          `A la relación "${match.name}" le falta el/los atributo(s): ${missingAttrs.join(
            ", ",
          )}.`,
        );
      }
    }
  }

  return missing;
};

// --- Modo "structural": solo compara cantidades, sin importar nombres ---

type EntityShapeKey = {
  attributeCount: number;
  keyAttributeCount: number;
  isWeak: boolean;
};

const entityShapeKey = (shape: EntityShapeKey): string =>
  `${shape.attributeCount}:${shape.keyAttributeCount}:${shape.isWeak}`;

const describeEntityShape = (shape: EntityShapeKey): string =>
  `${shape.attributeCount} atributo(s) (${shape.keyAttributeCount} de tipo key)${
    shape.isWeak ? ", entidad débil" : ""
  }`;

type RelationshipShapeKey = {
  cardinalities: string[]; // ya ordenadas
  attributeCount: number;
};

const relationshipShapeKey = (shape: RelationshipShapeKey): string =>
  `${[...shape.cardinalities].sort().join(",")}:${shape.attributeCount}`;

const describeRelationshipShape = (shape: RelationshipShapeKey): string =>
  `participantes con cardinalidad ${shape.cardinalities.join(":")}, con ${
    shape.attributeCount
  } atributo(s) propio(s)`;

const validateStructural = (
  erDoc: ER,
  expected: ExpectedAnswerStructural,
): string[] => {
  const missing: string[] = [];

  // --- Entidades ---
  const actualEntityShapeCounts = new Map<string, number>();
  for (const entity of erDoc.entities) {
    const key = entityShapeKey({
      attributeCount: entity.attributes.length,
      keyAttributeCount: entity.attributes.filter((a) => a.isKey).length,
      isWeak: entity.hasDependencies,
    });
    actualEntityShapeCounts.set(key, (actualEntityShapeCounts.get(key) ?? 0) + 1);
  }

  const expectedEntityShapeCounts = new Map<
    string,
    { count: number; shape: EntityShapeKey; labels: string[] }
  >();
  for (const entity of expected.entities) {
    const shapeK: EntityShapeKey = {
      attributeCount: entity.attributeCount,
      keyAttributeCount: entity.keyAttributeCount,
      isWeak: entity.isWeak ?? false,
    };
    const key = entityShapeKey(shapeK);
    const current = expectedEntityShapeCounts.get(key);
    if (current) {
      current.count += 1;
      current.labels.push(entity.label);
    } else {
      expectedEntityShapeCounts.set(key, {
        count: 1,
        shape: shapeK,
        labels: [entity.label],
      });
    }
  }

  const remainingEntityCounts = new Map(actualEntityShapeCounts);
  for (const [key, { count, shape: shapeK, labels }] of expectedEntityShapeCounts) {
    const available = remainingEntityCounts.get(key) ?? 0;
    if (available < count) {
      missing.push(
        `Faltan ${count - available} entidad(es) con la forma de ${labels.join(
          "/",
        )} (${describeEntityShape(shapeK)}).`,
      );
    }
    remainingEntityCounts.set(key, Math.max(0, available - count));
  }

  const extraEntityCount = Array.from(remainingEntityCounts.values()).reduce(
    (sum, n) => sum + n,
    0,
  );
  if (extraEntityCount > 0) {
    missing.push(
      `Tienes ${extraEntityCount} entidad(es) de más, o con una cantidad de atributos/keys que no corresponde a lo pedido en el enunciado.`,
    );
  }

  // --- Relaciones ---
  if (expected.relationships) {
    const actualRelShapeCounts = new Map<string, number>();
    for (const relationship of erDoc.relationships) {
      const cardinalities = relationship.participantEntities.map((p) =>
        p.isComposite ? "?" : p.cardinality,
      );
      const key = relationshipShapeKey({
        cardinalities,
        attributeCount: relationship.attributes.length,
      });
      actualRelShapeCounts.set(key, (actualRelShapeCounts.get(key) ?? 0) + 1);
    }

    const expectedRelShapeCounts = new Map<
      string,
      { count: number; shape: RelationshipShapeKey; labels: string[] }
    >();
    for (const rel of expected.relationships) {
      const shapeK: RelationshipShapeKey = {
        cardinalities: rel.cardinalities,
        attributeCount: rel.attributeCount,
      };
      const key = relationshipShapeKey(shapeK);
      const current = expectedRelShapeCounts.get(key);
      if (current) {
        current.count += 1;
        current.labels.push(rel.label);
      } else {
        expectedRelShapeCounts.set(key, {
          count: 1,
          shape: shapeK,
          labels: [rel.label],
        });
      }
    }

    const remainingRelCounts = new Map(actualRelShapeCounts);
    for (const [key, { count, shape: shapeK, labels }] of expectedRelShapeCounts) {
      const available = remainingRelCounts.get(key) ?? 0;
      if (available < count) {
        missing.push(
          `Falta una relación de tipo ${labels.join(
            "/",
          )}: se esperaban ${describeRelationshipShape(shapeK)}.`,
        );
      }
      remainingRelCounts.set(key, Math.max(0, available - count));
    }
  }

  return missing;
};