import { ER } from "../../ERDoc/types/parser/ER";

export type LevelId = 1 | 2 | 3 | 4 | 5 | 6;
export type SubLevelId = 1 | 2;

// --- Forma de la "respuesta esperada" de un ejercicio ---
//
// Hay dos modos de validación, porque el enunciado abstracto y el
// directo piden cosas distintas:
//
// - "structural" (enunciado abstracto, subLevel 1): el enunciado no da
//   nombres explícitos, así que solo se valida la CANTIDAD de entidades,
//   atributos y keys. El usuario puede nombrar todo como quiera.
//
// - "exact" (enunciado directo, subLevel 2): el enunciado da nombres
//   explícitos ("la entidad Libro", "el atributo ISBN"...), así que se
//   valida que esos nombres existan tal cual, además de las cantidades.

// ---------- Modo "exact" ----------

export type ExpectedAttributeExact = {
  name: string;
  isKey: boolean;
};

export type ExpectedEntityExact = {
  name: string;
  attributes: ExpectedAttributeExact[];
};

export type ExpectedParticipantExact = {
  entityName: string;
  cardinality: string; // ej. "1", "N"
};

export type ExpectedRelationshipExact = {
  name: string;
  participants: ExpectedParticipantExact[];
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
};

export type ExpectedAnswerStructural = {
  mode: "structural";
  entities: ExpectedEntityShape[];
};

export type ExpectedAnswer = ExpectedAnswerExact | ExpectedAnswerStructural;

export type ExerciseDefinition = {
  statement: string;
  expected: ExpectedAnswer;
};

// --- Datos reutilizados entre ejercicios (para no repetir) ---

// Formas (modo structural)
const LIBRO_SHAPE: ExpectedEntityShape = {
  label: "Libro",
  attributeCount: 3, // ISBN, Titulo, Ano
  keyAttributeCount: 1, // ISBN
};

const AUTOR_SHAPE: ExpectedEntityShape = {
  label: "Autor",
  attributeCount: 3, // RUT, Nombre, Nacionalidad
  keyAttributeCount: 1, // RUT
};

const EDITORIAL_SHAPE: ExpectedEntityShape = {
  label: "Editorial",
  attributeCount: 2, // Codigo, Nombre
  keyAttributeCount: 1, // Codigo
};

// Entidades exactas (modo exact)
const LIBRO_EXACT: ExpectedEntityExact = {
  name: "Libro",
  attributes: [
    { name: "ISBN", isKey: true },
    { name: "Titulo", isKey: false },
    { name: "Anio", isKey: false },
  ],
};

const AUTOR_EXACT: ExpectedEntityExact = {
  name: "Autor",
  attributes: [
    { name: "RUT", isKey: true },
    { name: "Nombre", isKey: false },
    { name: "Nacionalidad", isKey: false },
  ],
};

const EDITORIAL_EXACT: ExpectedEntityExact = {
  name: "Editorial",
  attributes: [
    { name: "Codigo", isKey: true },
    { name: "Nombre", isKey: false },
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
        "Crea dos entidades independientes en el editor: Libro y Autor. * La entidad Libro debe incluir los atributos ISBN (marcado como llave primaria utilizando key), Titulo y Anio. * La entidad Autor debe incluir los atributos RUT (marcado como llave primaria utilizando key), Nombre y Nacionalidad.",
      expected: {
        mode: "exact",
        entities: [LIBRO_EXACT, AUTOR_EXACT],
      },
    },
  },
  2: {
    1: {
      statement:
        "Continuando con la modernización de la biblioteca, ahora se requiere incluir las editoriales que publican los textos. Una editorial posee un código único y un nombre. Tras consultar con el encargado, nos aclara la siguiente regla de negocio: 'Una editorial puede publicar muchos libros a lo largo del tiempo, pero cada libro en nuestro catálogo pertenece y ha sido publicado por una única editorial'. Conecta la entidad Libro (creada anteriormente) con esta nueva estructura.",
      expected: {
        mode: "structural",
        entities: [LIBRO_SHAPE, AUTOR_SHAPE, EDITORIAL_SHAPE],
      },
    },
    2: {
      statement:
        "Manteniendo las entidades Libro y Autor del nivel anterior 1. Crea una nueva entidad llamada Editorial con los atributos Codigo (marcado con key) y Nombre. 2. Define una relación llamada Publica entre Editorial y Libro. 3. Establece la cardinalidad de uno a muchos ($1:N$), de modo que Editorial participe con cardinalidad 1 y Libro con cardinalidad N.",
      expected: {
        mode: "exact",
        entities: [LIBRO_EXACT, AUTOR_EXACT, EDITORIAL_EXACT],
        relationships: [
          {
            name: "Publica",
            participants: [
              { entityName: "Editorial", cardinality: "1" },
              { entityName: "Libro", cardinality: "N" },
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

    const actualAttrsByName = new Map(
      actualEntity.attributes.map((attr) => [attr.name.toLowerCase(), attr]),
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
          `El atributo "${expectedAttr.name}" de "${expectedEntity.name}" debería estar marcado como llave (key).`,
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

  if (expected.relationships) {
    const actualRelByName = new Map(
      erDoc.relationships.map((rel) => [rel.name.toLowerCase(), rel]),
    );

    for (const expectedRel of expected.relationships) {
      const actualRel = actualRelByName.get(expectedRel.name.toLowerCase());

      if (!actualRel) {
        missing.push(`Falta la relación "${expectedRel.name}".`);
        continue;
      }

      for (const expectedPart of expectedRel.participants) {
        const actualPart = actualRel.participantEntities.find(
          (p) =>
            p.entityName.toLowerCase() ===
            expectedPart.entityName.toLowerCase(),
        );

        if (!actualPart) {
          missing.push(
            `La relación "${expectedRel.name}" debería incluir a la entidad "${expectedPart.entityName}".`,
          );
          continue;
        }

        if (
          !actualPart.isComposite &&
          actualPart.cardinality !== expectedPart.cardinality
        ) {
          missing.push(
            `La participación de "${expectedPart.entityName}" en "${expectedRel.name}" debería tener cardinalidad "${expectedPart.cardinality}" (tiene "${actualPart.cardinality}").`,
          );
        }
      }
    }

    const expectedRelNames = new Set(
      expected.relationships.map((r) => r.name.toLowerCase()),
    );
    const extraRels = erDoc.relationships.filter(
      (r) => !expectedRelNames.has(r.name.toLowerCase()),
    );
    if (extraRels.length > 0) {
      missing.push(
        `Hay relación(es) que no pide el enunciado: ${extraRels
          .map((r) => r.name)
          .join(", ")}.`,
      );
    }
  }

  return missing;
};

// --- Modo "structural": solo compara cantidades, sin importar nombres ---

type EntityShape = {
  attributeCount: number;
  keyAttributeCount: number;
};

const shapeKey = (shape: EntityShape): string =>
  `${shape.attributeCount}:${shape.keyAttributeCount}`;

const describeShape = (shape: EntityShape): string =>
  `${shape.attributeCount} atributo(s) (${shape.keyAttributeCount} de tipo key)`;

const validateStructural = (
  erDoc: ER,
  expected: ExpectedAnswerStructural,
): string[] => {
  const missing: string[] = [];

  const actualShapeCounts = new Map<string, number>();
  for (const entity of erDoc.entities) {
    const shape: EntityShape = {
      attributeCount: entity.attributes.length,
      keyAttributeCount: entity.attributes.filter((a) => a.isKey).length,
    };
    const key = shapeKey(shape);
    actualShapeCounts.set(key, (actualShapeCounts.get(key) ?? 0) + 1);
  }

  const expectedShapeCounts = new Map<
    string,
    { count: number; shape: EntityShape; labels: string[] }
  >();
  for (const entity of expected.entities) {
    const shape: EntityShape = {
      attributeCount: entity.attributeCount,
      keyAttributeCount: entity.keyAttributeCount,
    };
    const key = shapeKey(shape);
    const current = expectedShapeCounts.get(key);
    if (current) {
      current.count += 1;
      current.labels.push(entity.label);
    } else {
      expectedShapeCounts.set(key, {
        count: 1,
        shape,
        labels: [entity.label],
      });
    }
  }

  const remainingActualCounts = new Map(actualShapeCounts);
  for (const [key, { count, shape, labels }] of expectedShapeCounts) {
    const available = remainingActualCounts.get(key) ?? 0;

    if (available < count) {
      const faltantes = count - available;
      missing.push(
        `Faltan ${faltantes} entidad(es) con la forma de ${labels.join(
          "/",
        )} (${describeShape(shape)}).`,
      );
    }

    remainingActualCounts.set(key, Math.max(0, available - count));
  }

  const totalExtra = Array.from(remainingActualCounts.values()).reduce(
    (sum, n) => sum + n,
    0,
  );
  if (totalExtra > 0) {
    missing.push(
      `Tienes ${totalExtra} entidad(es) de más, o con una cantidad de atributos/keys que no corresponde a lo pedido en el enunciado.`,
    );
  }

  return missing;
};