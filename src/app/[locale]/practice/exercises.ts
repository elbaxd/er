import { ER } from "../../../ERDoc/types/parser/ER";

export type LevelId = 1 | 2 | 3 | 4 | 5 | 6;
export type SubLevelId = 1 | 2;

// --- Forma de la "respuesta esperada" de un ejercicio ---
// La validación es puramente ESTRUCTURAL: no importa cómo el usuario
// nombre sus entidades o atributos, solo importan las cantidades.
// Cada ExpectedEntity describe la "forma" de una entidad esperada
// (cuántos atributos tiene y cuántos de ellos deben ser key).
// `label` es solo para mostrar mensajes de feedback más claros al
// usuario (ej. "una entidad como Libro"); no se usa para comparar.
// Las relaciones se pueden agregar más adelante extendiendo
// ExpectedAnswer y validateAnswer.

export type ExpectedEntity = {
  label: string;
  attributeCount: number;
  keyAttributeCount: number;
};

export type ExpectedAnswer = {
  entities: ExpectedEntity[];
};

export type ExerciseDefinition = {
  statement: string;
  expected: ExpectedAnswer;
};

// --- Formas de entidad reutilizadas entre ejercicios (para no repetir) ---

const LIBRO_ENTITY: ExpectedEntity = {
  label: "Libro",
  attributeCount: 3, // ISBN, Titulo, Ano
  keyAttributeCount: 1, // ISBN
};

const AUTOR_ENTITY: ExpectedEntity = {
  label: "Autor",
  attributeCount: 3, // RUT, Nombre, Nacionalidad
  keyAttributeCount: 1, // RUT
};

const EDITORIAL_ENTITY: ExpectedEntity = {
  label: "Editorial",
  attributeCount: 2, // Codigo, Nombre
  keyAttributeCount: 1, // Codigo
};

// --- Enunciados y respuesta esperada por nivel/subnivel ---

export const EXERCISES: Partial<
  Record<LevelId, Partial<Record<SubLevelId, ExerciseDefinition>>>
> = {
  1: {
    1: {
      statement:
        "Una biblioteca comunitaria necesita digitalizar su inventario. Desean guardar el registro de cada uno de los libros que poseen, distinguiéndolos por su código ISBN único, su título y su año de publicación. Adicionalmente, quieren tener la información de los autores, identificados de forma única por su RUT, registrando también su nombre y nacionalidad. Por ahora, no se requiere modelar la relación entre ambos, solo registrar ambas partes por separado.",
      expected: { entities: [LIBRO_ENTITY, AUTOR_ENTITY] },
    },
    2: {
      statement:
        "Crea dos entidades independientes en el editor: Libro y Autor. * La entidad Libro debe incluir los atributos ISBN (marcado como llave primaria utilizando key), Titulo y Ano. * La entidad Autor debe incluir los atributos RUT (marcado como llave primaria utilizando key), Nombre y Nacionalidad.",
      expected: { entities: [LIBRO_ENTITY, AUTOR_ENTITY] },
    },
  },
  2: {
    1: {
      statement:
        "Continuando con la modernización de la biblioteca, ahora se requiere incluir las editoriales que publican los textos. Una editorial posee un código único y un nombre. Tras consultar con el encargado, nos aclara la siguiente regla de negocio: 'Una editorial puede publicar muchos libros a lo largo del tiempo, pero cada libro en nuestro catálogo pertenece y ha sido publicado por una única editorial'. Conecta la entidad Libro (creada anteriormente) con esta nueva estructura.",
      expected: { entities: [LIBRO_ENTITY, AUTOR_ENTITY, EDITORIAL_ENTITY] },
    },
    2: {
      statement:
        "Manteniendo las entidades Libro y Autor del nivel anterior 1. Crea una nueva entidad llamada Editorial con los atributos Codigo (marcado con key) y Nombre. 2. Define una relación llamada Publica entre Editorial y Libro. 3. Establece la cardinalidad de uno a muchos ($1:N$), de modo que Editorial participe con cardinalidad 1 y Libro con cardinalidad N.",
      expected: { entities: [LIBRO_ENTITY, AUTOR_ENTITY, EDITORIAL_ENTITY] },
    },
  },
};

export const getExercise = (
  level: LevelId,
  subLevel: SubLevelId,
): ExerciseDefinition | undefined => EXERCISES[level]?.[subLevel];

// --- Validación estructural ---
// No compara nombres: agrupa las entidades (esperadas y reales) por su
// "forma" -- (cantidad de atributos, cantidad de esos atributos que son
// key) -- y compara cuántas entidades hay de cada forma. Así el usuario
// puede nombrar sus entidades y atributos como quiera; lo que importa
// es que la estructura (cantidades) calce con lo pedido.

export type ValidationResult = {
  correct: boolean;
  missing: string[];
};

type EntityShape = {
  attributeCount: number;
  keyAttributeCount: number;
};

const shapeKey = (shape: EntityShape): string =>
  `${shape.attributeCount}:${shape.keyAttributeCount}`;

const describeShape = (shape: EntityShape): string =>
  `${shape.attributeCount} atributo(s) (${shape.keyAttributeCount} de tipo key)`;

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

  const missing: string[] = [];

  // Cuenta cuántas entidades reales hay por cada "forma" (attrs, keys)
  const actualShapeCounts = new Map<string, number>();
  for (const entity of erDoc.entities) {
    const shape: EntityShape = {
      attributeCount: entity.attributes.length,
      keyAttributeCount: entity.attributes.filter((a) => a.isKey).length,
    };
    const key = shapeKey(shape);
    actualShapeCounts.set(key, (actualShapeCounts.get(key) ?? 0) + 1);
  }

  // Cuenta cuántas entidades se esperan por cada "forma", junto con
  // un label de referencia para dar un mensaje más claro.
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

  // Compara cada forma esperada contra lo que hay realmente.
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

  // Lo que sobró en remainingActualCounts son entidades "de más" que
  // no corresponden a ninguna forma esperada (o exceden la cantidad pedida).
  const totalExtra = Array.from(remainingActualCounts.values()).reduce(
    (sum, n) => sum + n,
    0,
  );
  if (totalExtra > 0) {
    missing.push(
      `Tienes ${totalExtra} entidad(es) de más, o con una cantidad de atributos/keys que no corresponde a lo pedido en el enunciado.`,
    );
  }

  return { correct: missing.length === 0, missing };
};
