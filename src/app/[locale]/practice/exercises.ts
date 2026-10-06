import { ER } from "../../ERDoc/types/parser/ER";
import { Relationship } from "../../ERDoc/types/parser/Relationship";

export type LevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type SubLevelId = 1 | 2;

// --- Forma de la "respuesta esperada" de un ejercicio ---
//
// - "structural" (enunciado abstracto): no exige nombres, solo
//   cantidades (atributos, keys, y para relaciones: cardinalidades,
//   participaciones y cantidad de atributos propios).
// - "exact" (enunciado directo): exige nombres específicos, porque el
//   enunciado los da explícitamente ("la entidad Usuario", "rut"...).

// ---------- Modo "exact" ----------

export type ExpectedAttributeExact = {
  name: string;
  isKey: boolean;
};

export type ExpectedEntityExact = {
  name: string;
  attributes?: ExpectedAttributeExact[];
  isWeak?: boolean;
  extendsName?: string; // Entidad padre de la cual hereda (EXTENDS)
};

export type ExpectedParticipantExact = {
  entityName: string;
  cardinality?: string;
  participation?: "total" | "partial";
};

export type ExpectedRelationshipExact = {
  name?: string;
  participants: ExpectedParticipantExact[];
  attributes?: string[];
};

export type ExpectedAggregationExact = {
  name?: string;
  aggregatedRelationshipName: string;
};

export type ExpectedAnswerExact = {
  mode: "exact";
  entities: ExpectedEntityExact[];
  relationships?: ExpectedRelationshipExact[];
  aggregations?: ExpectedAggregationExact[];
};

// ---------- Modo "structural" ----------

export type ExpectedEntityShape = {
  label: string; // Solo para feedback al usuario
  attributeCount: number;
  keyAttributeCount: number;
  isWeak?: boolean;
  hasParent?: boolean; // Requiere cláusula EXTENDS
};

export type ExpectedRelationshipShape = {
  label: string;
  cardinalities: string[]; // Multiset de cardinalidades, ej. ["1", "N"]
  attributeCount: number;
  totalParticipationsCount?: number; // Participaciones obligatorias (!)
};

export type ExpectedAggregationShape = {
  label: string;
};

export type ExpectedAnswerStructural = {
  mode: "structural";
  entities: ExpectedEntityShape[];
  relationships?: ExpectedRelationshipShape[];
  aggregations?: ExpectedAggregationShape[];
};

export type ExpectedAnswer = ExpectedAnswerExact | ExpectedAnswerStructural;

export type ExerciseDefinition = {
  statement: string;
  expected: ExpectedAnswer;
  starterCode: string;
};

// --- Formas reutilizadas (modo structural) ---

const shape = (
  label: string,
  attributeCount: number,
  keyAttributeCount: number,
  isWeak: boolean = false,
  hasParent: boolean = false,
): ExpectedEntityShape => ({
  label,
  attributeCount,
  keyAttributeCount,
  isWeak,
  hasParent,
});

// Entidades base Biblioteca
const LIBRO_SHAPE = shape("Libro", 3, 1); // ISBN, Titulo, Ano
const AUTOR_SHAPE = shape("Autor", 3, 1); // RUT, Nombre, Nacionalidad
const EDITORIAL_SHAPE = shape("Editorial", 2, 1); // Codigo, Nombre
const SOCIO_SHAPE = shape("Socio", 3, 1); // RUT, Nombre, Telefono
const EJEMPLAR_SHAPE = shape("Ejemplar (débil)", 2, 1, true); // Numero_Copia (pkey), Estado
const LIBRO_DIGITAL_SHAPE = shape("LibroDigital (subclase)", 2, 0, false, true); // Formato, Tamano_MB
const LIBRO_IMPRESO_SHAPE = shape("LibroImpreso (subclase)", 2, 0, false, true); // Tipo_Tapa, Num_Paginas
const ARTICULO_DIGITAL_SHAPE = shape("ArticuloDigital (subclase nivel 8)", 1, 0, false, true); // DOI
const AUDIOLIBRO_SHAPE = shape("AudioLibro (subclase nivel 8)", 2, 0, false, true); // Duracion, Narrador
const PROVEEDOR_SHAPE = shape("Proveedor", 2, 1); // RUT, Nombre_Empresa
const SUCURSAL_SHAPE = shape("Sucursal", 2, 1); // Codigo_Sucursal, Direccion
const ESTANTE_SHAPE = shape("Estante (débil)", 2, 1, true); // Numero_Estante (pkey), Categoria

// --- Entidades exactas predefinidas/reutilizadas (modo exact) ---

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

const CURSO_EXACT: ExpectedEntityExact = { name: "Curso" };
const ESTUDIANTE_EXACT: ExpectedEntityExact = { name: "Estudiante" };
const DEPARTAMENTO_EXACT: ExpectedEntityExact = { name: "Departamento" };
const EMPLEADO_EXACT: ExpectedEntityExact = { name: "Empleado" };
const EDIFICIO_EXACT: ExpectedEntityExact = { name: "Edificio" };
const SALA_EXACT: ExpectedEntityExact = {
  name: "Sala",
  isWeak: true,
  attributes: [
    { name: "numero_sala", isKey: true },
    { name: "capacidad", isKey: false },
  ],
};

// --- Enunciados y respuesta esperada por nivel/subnivel (1 al 10) ---

export const EXERCISES: Partial<
  Record<LevelId, Partial<Record<SubLevelId, ExerciseDefinition>>>
> = {
  // ==========================================
  // NIVEL 1: Entidades y Atributos Básicos
  // ==========================================
  1: {
    1: {
      statement:
        "Bienvenido a ERdoc! En este nivel aprenderás a definir Entidades y sus Atributos. Para declarar una entidad se utiliza el bloque entity Nombre { ... }. Cada entidad requiere una Llave Primaria que la identifique unívocamente, indicada anteponiendo la palabra key.\n\nTu desafío: Crea dos entidades aisladas:\n1. Una entidad Usuario con el atributo rut (marcado con key), además de nombre y email.\n2. Una entidad Producto con el atributo codigo (marcado con key), además de nombre_producto y precio.",
      expected: {
        mode: "exact",
        entities: [USUARIO_EXACT, PRODUCTO_EXACT],
      },
      starterCode: `entity Usuario {\n\n}\n\nentity Producto {\n\n}\n`,
    },
    2: {
      statement:
        "Una biblioteca comunitaria necesita digitalizar su inventario. Desean registrar cada libro distinguiéndolo por su código ISBN único, su título y su año de publicación. Adicionalmente, requieren la información de los autores, identificados por su RUT único, registrando también su nombre y nacionalidad. Modela ambas entidades por separado.",
      expected: {
        mode: "structural",
        entities: [LIBRO_SHAPE, AUTOR_SHAPE],
      },
      starterCode: `entity Libro {\n\n}\n\nentity Autor {\n\n}\n`,
    },
  },

  // ==========================================
  // NIVEL 2: Relaciones Simples y Cardinalidades (1:N)
  // ==========================================
  2: {
    1: {
      statement:
        "Nuevo concepto: Relaciones y Cardinalidades (1:N). Las entidades se conectan mediante relations con la sintaxis relation Nombre(Entidad1 cardinalidad, Entidad2 cardinalidad). En una relación 1:N (Uno a Muchos), un elemento de un lado se vincula con un único elemento del otro, mientras que este último puede asociarse a varios.\n\nTu desafío: Tienes las entidades Curso y Estudiante. Crea una relación llamada Inscribe indicando que un curso tiene muchos estudiantes (N), pero cada estudiante pertenece a un único curso (1).",
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
      starterCode: `entity Curso {\n  codigo key\n  nombre\n}\n\nentity Estudiante {\n  rut key\n  nombre\n}\n\n// TODO: Crea la relación Inscribe (1:N) entre Curso y Estudiante\n`,
    },
    2: {
      statement:
        "Siguiendo con la biblioteca, ahora incorporamos a las editoriales encargadas de las obras. Una editorial cuenta con un código único y su nombre comercial. Modela la entidad de las editoriales y conéctala con los libros: una editorial puede publicar muchos libros (N), pero cada libro es publicado por exactamente una editorial (1).",
      expected: {
        mode: "structural",
        entities: [LIBRO_SHAPE, EDITORIAL_SHAPE],
        relationships: [
          {
            label: "Publicación (Editorial 1 - N Libro)",
            cardinalities: ["1", "N"],
            attributeCount: 0,
          },
        ],
      },
      starterCode: `entity Libro {\n  isbn key\n  titulo\n  ano\n}\n\nentity Editorial {\n\n}\n\n// TODO: Modela la relación 1:N entre Editorial y Libro\n`,
    },
  },

  // ==========================================
  // NIVEL 3: Restricciones de Participación Total (!)
  // ==========================================
  3: {
    1: {
      statement:
        "Nuevo concepto: Participación Total (!). Cuando la existencia de una entidad en una relación es obligatoria, se añade un signo de exclamación (!) junto a su cardinalidad (por ejemplo: Empleado N!). Esto indica que ninguna instancia puede existir sin estar asociada.\n\nTu desafío: Tienes las entidades Departamento y Empleado. Crea una relación llamada Pertenece_A de cardinalidad 1:N asegurando que TODO empleado deba pertenecer obligatoriamente a un departamento (Empleado N!, Departamento 1).",
      expected: {
        mode: "exact",
        entities: [DEPARTAMENTO_EXACT, EMPLEADO_EXACT],
        relationships: [
          {
            name: "Pertenece_A",
            participants: [
              { entityName: "Departamento", cardinality: "1" },
              { entityName: "Empleado", cardinality: "N", participation: "total" },
            ],
          },
        ],
      },
      starterCode: `entity Departamento {\n  id_dept key\n  nombre\n}\n\nentity Empleado {\n  rut key\n  nombre\n}\n\n// TODO: Crea la relación Pertenece_A con participación total (!) para Empleado\n`,
    },
    2: {
      statement:
        "En la biblioteca comunitaria se ha establecido una regla estricta de catalogación: no puede registrarse ningún libro sin que esté obligatoriamente asignado a una editorial responsable. Sin embargo, pueden existir editoriales registradas que aún no tengan libros publicados. Modela la relación asegurando la participación obligatoria total (!) en el extremo de los libros.",
      expected: {
        mode: "structural",
        entities: [LIBRO_SHAPE, EDITORIAL_SHAPE],
        relationships: [
          {
            label: "Publicación obligatoria (Editorial 1 - N! Libro)",
            cardinalities: ["1", "N"],
            attributeCount: 0,
            totalParticipationsCount: 1,
          },
        ],
      },
      starterCode: `entity Libro {\n  isbn key\n  titulo\n  ano\n}\n\nentity Editorial {\n  codigo key\n  nombre\n}\n\n// TODO: Modela la relación 1:N exigiendo participación total (!) en Libro\n`,
    },
  },

  // ==========================================
  // NIVEL 4: Relaciones de Muchos a Muchos (N:M)
  // ==========================================
  4: {
    1: {
      statement:
        "Nuevo concepto: Relaciones Muchos a Muchos (N:M). Ocurre cuando múltiples elementos de una entidad pueden vincularse con varios elementos de otra entidad, usando cardinalidades N y M.\n\nTu desafío: Tienes las entidades Estudiante y Curso. Modela la relación de inscripción llamada Inscribe con cardinalidad N:M, indicando que un estudiante puede inscribir múltiples cursos (N) y un curso puede recibir a múltiples estudiantes (M).",
      expected: {
        mode: "exact",
        entities: [ESTUDIANTE_EXACT, CURSO_EXACT],
        relationships: [
          {
            name: "Inscribe",
            participants: [
              { entityName: "Estudiante", cardinality: "N" },
              { entityName: "Curso", cardinality: "M" },
            ],
          },
        ],
      },
      starterCode: `entity Estudiante {\n  rut key\n  nombre\n}\n\nentity Curso {\n  codigo key\n  nombre\n}\n\n// TODO: Crea la relación Inscribe con cardinalidad N:M\n`,
    },
    2: {
      statement:
        "La biblioteca desea vincular formalmente a los libros con sus autores. Un libro puede ser producto de una coautoría entre varios autores, y un autor a su vez puede haber escrito múltiples obras catalogadas en el recinto. Modela la relación de autoría entre ambas entidades con cardinalidad muchos a muchos.",
      expected: {
        mode: "structural",
        entities: [LIBRO_SHAPE, AUTOR_SHAPE],
        relationships: [
          {
            label: "Autoría N:M (Libro - Autor)",
            cardinalities: ["M", "N"],
            attributeCount: 0,
          },
        ],
      },
      starterCode: `entity Libro {\n  isbn key\n  titulo\n  ano\n}\n\nentity Autor {\n  rut key\n  nombre\n  nacionalidad\n}\n\n// TODO: Modela la relación N:M de autoría\n`,
    },
  },

  // ==========================================
  // NIVEL 5: Atributos en Relaciones
  // ==========================================
  5: {
    1: {
      statement:
        "Nuevo concepto: Atributos en Relaciones. Una relación puede contener sus propios atributos para registrar detalles del vínculo entre entidades. Se definen entre llaves { ... } en la misma relación.\n\nTu desafío: Partiendo de Estudiante y Curso, define la relación Inscribe (N:M) e incorpora en ella los atributos propios fecha_inscripcion y nota_final.",
      expected: {
        mode: "exact",
        entities: [ESTUDIANTE_EXACT, CURSO_EXACT],
        relationships: [
          {
            name: "Inscribe",
            participants: [
              { entityName: "Estudiante", cardinality: "N" },
              { entityName: "Curso", cardinality: "M" },
            ],
            attributes: ["fecha_inscripcion", "nota_final"],
          },
        ],
      },
      starterCode: `entity Estudiante {\n  rut key\n  nombre\n}\n\nentity Curso {\n  codigo key\n  nombre\n}\n\n// TODO: Crea la relación Inscribe (N:M) con atributos propios fecha_inscripcion y nota_final\n`,
    },
    2: {
      statement:
        "Para gestionar el préstamo de libros, la biblioteca registrará a sus socios (identificados con su RUT único, nombre y teléfono). Un socio puede solicitar prestados varios libros, y un mismo libro puede ser prestado a distintos socios a lo largo del tiempo. Agrega a la relación de préstamo dos atributos propios: fecha_prestamo y fecha_devolucion.",
      expected: {
        mode: "structural",
        entities: [LIBRO_SHAPE, SOCIO_SHAPE],
        relationships: [
          {
            label: "Préstamo con atributos (Socio N:M Libro)",
            cardinalities: ["M", "N"],
            attributeCount: 2,
          },
        ],
      },
      starterCode: `entity Libro {\n  isbn key\n  titulo\n  ano\n}\n\nentity Socio {\n  rut key\n  nombre\n  telefono\n}\n\n// TODO: Modela la relación N:M de préstamo incorporando 2 atributos propios\n`,
    },
  },

  // ==========================================
  // NIVEL 6: Entidades Débiles y Llaves Parciales
  // ==========================================
  6: {
    1: {
      statement:
        "Nuevo concepto: Entidades Débiles (DEPENDS ON). Una entidad débil no tiene identidad propia global y depende estructuralmente de una entidad fuerte. Su identificador local se define como llave parcial usando pkey, y su subordinación se declara con DEPENDS ON NombreEntidadFuerte.\n\nTu desafío: Tienes la entidad fuerte Edificio. Declara la entidad débil Sala con su llave parcial numero_sala (pkey), el atributo capacidad, y la subordinación DEPENDS ON Edificio. Luego, añade la relación que las conecta (cardinalidad 1! para Sala y N para Edificio).",
      expected: {
        mode: "exact",
        entities: [EDIFICIO_EXACT, SALA_EXACT],
        relationships: [
          {
            participants: [
              { entityName: "Sala", cardinality: "1", participation: "total" },
              { entityName: "Edificio", cardinality: "N" },
            ],
          },
        ],
      },
      starterCode: `entity Edificio {\n  codigo key\n  nombre\n}\n\n// TODO: Declara Sala con llave parcial (pkey), capacidad, DEPENDS ON Edificio y su relación\n`,
    },
    2: {
      statement:
        "La biblioteca posee múltiples ejemplares físicos de cada libro. Un ejemplar no posee un código único global; se numera secuencialmente dentro del contexto de cada libro mediante un número de copia (llave parcial) y su estado de conservación. Si un libro se retira del catálogo, sus ejemplares desaparecen. Modela la entidad débil Ejemplar subordinada a Libro y la relación entre ambos.",
      expected: {
        mode: "structural",
        entities: [LIBRO_SHAPE, EJEMPLAR_SHAPE],
        relationships: [
          {
            label: "Dependencia débil (Ejemplar 1! - N Libro)",
            cardinalities: ["1", "N"],
            attributeCount: 0,
            totalParticipationsCount: 1,
          },
        ],
      },
      starterCode: `entity Libro {\n  isbn key\n  titulo\n  ano\n}\n\n// TODO: Modela la entidad débil Ejemplar y su relación de dependencia con Libro\n`,
    },
  },

  // ==========================================
  // NIVEL 7: Especialización y Jerarquías Simples (EXTENDS)
  // ==========================================
  7: {
    1: {
      statement:
        "Nuevo concepto: Jerarquías Simples (EXTENDS). La herencia permite que una entidad hija adquiera la llave primaria y atributos de su entidad padre usando la cláusula EXTENDS Padre. Las entidades hijas no deben volver a declarar una llave primaria (key).\n\nTu desafío: Tienes la entidad Empleado (con rut key, nombre y salario). Declara dos entidades especializadas: Medico (con atributo propio especialidad) y Enfermero (con atributo propio turno), ambas heredando de Empleado mediante EXTENDS.",
      expected: {
        mode: "exact",
        entities: [
          {
            name: "Empleado",
            attributes: [
              { name: "rut", isKey: true },
              { name: "nombre", isKey: false },
              { name: "salario", isKey: false },
            ],
          },
          {
            name: "Medico",
            extendsName: "Empleado",
            attributes: [{ name: "especialidad", isKey: false }],
          },
          {
            name: "Enfermero",
            extendsName: "Empleado",
            attributes: [{ name: "turno", isKey: false }],
          },
        ],
      },
      starterCode: `entity Empleado {\n  rut key\n  nombre\n  salario\n}\n\n// TODO: Declara las entidades Medico y Enfermero extendiendo de Empleado\n`,
    },
    2: {
      statement:
        "La biblioteca incorporará préstamos en diferentes formatos. Todos los libros conservan su ISBN como identificador general, título y año, pero se diferencian en dos categorías especializadas: los libros digitales (con formato de archivo y tamaño en MB) y los libros impresos (con tipo de tapa y número de páginas). Modela la jerarquía utilizando herencia desde la entidad general.",
      expected: {
        mode: "structural",
        entities: [LIBRO_SHAPE, LIBRO_DIGITAL_SHAPE, LIBRO_IMPRESO_SHAPE],
      },
      starterCode: `entity Libro {\n  isbn key\n  titulo\n  ano\n}\n\n// TODO: Modela dos subclases que hereden de Libro con sus atributos propios\n`,
    },
  },

  // ==========================================
  // NIVEL 8: Jerarquías Multinivel o Múltiples Derivaciones
  // ==========================================
  8: {
    1: {
      statement:
        "Nuevo concepto: Jerarquías Multinivel. En modelado conceptual, una subclase puede a su vez ser superclase de niveles inferiores mediante la propagación sucesiva de EXTENDS.\n\nTu desafío: Tienes la entidad base Persona (con rut key y nombre). Deriva de ella la entidad intermedia Miembro_Academico (con email_inst) usando EXTENDS. Finalmente, crea dos subclases que extiendan de Miembro_Academico: Profesor (con categoria) y Alumno (con carrera).",
      expected: {
        mode: "exact",
        entities: [
          {
            name: "Persona",
            attributes: [
              { name: "rut", isKey: true },
              { name: "nombre", isKey: false },
            ],
          },
          {
            name: "Miembro_Academico",
            extendsName: "Persona",
            attributes: [{ name: "email_inst", isKey: false }],
          },
          {
            name: "Profesor",
            extendsName: "Miembro_Academico",
            attributes: [{ name: "categoria", isKey: false }],
          },
          {
            name: "Alumno",
            extendsName: "Miembro_Academico",
            attributes: [{ name: "carrera", isKey: false }],
          },
        ],
      },
      starterCode: `entity Persona {\n  rut key\n  nombre\n}\n\n// TODO: Crea Miembro_Academico EXTENDS Persona, y luego Profesor y Alumno EXTENDS Miembro_Academico\n`,
    },
    2: {
      statement:
        "La sección digital de la biblioteca continúa diversificándose. Los libros digitales (que ya derivan de la entidad general Libro) se subdividen a su vez en dos categorías especializadas: artículos digitales (con su código identificador DOI propio) y audiolibros (con duración en minutos y nombre del narrador). Modela la jerarquía multinivel resultante.",
      expected: {
        mode: "structural",
        entities: [
          LIBRO_SHAPE,
          LIBRO_DIGITAL_SHAPE,
          ARTICULO_DIGITAL_SHAPE,
          AUDIOLIBRO_SHAPE,
        ],
      },
      starterCode: `entity Libro {\n  isbn key\n  titulo\n  ano\n}\n\nentity LibroDigital extends Libro {\n  formato\n  tamano_mb\n}\n\n// TODO: Modela dos subclases que hereden de LibroDigital\n`,
    },
  },

  // ==========================================
  // NIVEL 9: Agregaciones Básicas
  // ==========================================
  9: {
    1: {
      statement:
        "Nuevo concepto: Agregaciones (aggregation). Una agregación permite encapsular una relación entre entidades como una abstracción de orden superior, de modo que otra entidad pueda relacionarse con el conjunto de esa relación. Se declara con aggregation Nombre (Relacion).\n\nTu desafío: Tienes las entidades Empleado y Proyecto, y la relación Trabaja_En (N:M). Encapsula esta relación dentro de una agregación llamada Asignacion. Luego, conecta la entidad Evaluador con la agregación Asignacion mediante una relación llamada Evalua (1:N).",
      expected: {
        mode: "exact",
        entities: [
          { name: "Empleado" },
          { name: "Proyecto" },
          { name: "Evaluador", attributes: [{ name: "id_evaluador", isKey: true }, { name: "nombre", isKey: false }] },
        ],
        relationships: [
          {
            name: "Trabaja_En",
            participants: [
              { entityName: "Empleado", cardinality: "N" },
              { entityName: "Proyecto", cardinality: "M" },
            ],
          },
          {
            name: "Evalua",
            participants: [
              { entityName: "Evaluador", cardinality: "1" },
              { entityName: "Asignacion", cardinality: "N" },
            ],
          },
        ],
        aggregations: [
          {
            name: "Asignacion",
            aggregatedRelationshipName: "Trabaja_En",
          },
        ],
      },
      starterCode: `entity Empleado {\n  rut key\n  nombre\n}\n\nentity Proyecto {\n  id_proyecto key\n  nombre_proyecto\n}\n\nentity Evaluador {\n  id_evaluador key\n  nombre\n}\n\nrelation Trabaja_En(Empleado N, Proyecto M)\n\n// TODO: Declara la agregación Asignacion sobre Trabaja_En y la relación Evalua con Evaluador\n`,
    },
    2: {
      statement:
        "La biblioteca gestiona convenios de suministro literario donde proveedores externos entregan ediciones de libros. La entrega de libros por parte de proveedores es una relación muchos a muchos. Para auditar el proceso, la administración de la biblioteca requiere que un inspector califique periódicamente cada acuerdo de suministro existente. Encapsula la relación de suministro en una agregación y asóciala con la entidad del inspector.",
      expected: {
        mode: "structural",
        entities: [
          LIBRO_SHAPE,
          PROVEEDOR_SHAPE,
          shape("Inspector", 2, 1),
        ],
        relationships: [
          {
            label: "Suministro N:M (Libro - Proveedor)",
            cardinalities: ["M", "N"],
            attributeCount: 0,
          },
          {
            label: "Auditoría (Inspector 1 - N Suministro)",
            cardinalities: ["1", "N"],
            attributeCount: 0,
          },
        ],
        aggregations: [
          { label: "Agregación de Suministro" },
        ],
      },
      starterCode: `entity Libro {\n  isbn key\n  titulo\n  ano\n}\n\nentity Proveedor {\n  rut key\n  nombre_empresa\n}\n\nentity Inspector {\n  id_inspector key\n  nombre\n}\n\n// TODO: Modela la relación N:M entre Libro y Proveedor, la agregación sobre ella, y la relación con Inspector\n`,
    },
  },

  // ==========================================
  // NIVEL 10: Integración Avanzada de Esquema Conceptual
  // ==========================================
  10: {
    1: {
      statement:
        "Desafío de Integración Final: En este nivel integrarás entidades débiles, jerarquías de especialización (EXTENDS) y agregaciones en un modelo integral de salud.\n\nTu desafío:\n1. Crea la entidad fuerte Hospital (con id_hosp key y nombre) y su entidad débil Pabellon (con numero pkey y piso), declarando DEPENDS ON Hospital y su relación.\n2. Declara la entidad padre Personal (con rut key y nombre). Extiende de ella dos subclases: Medico (con especialidad) y Paciente (con diagnostico).\n3. Modela la relación Atiende (N:M) entre Medico y Paciente y agrúpala en una agregación llamada Consulta.\n4. Conecta Consulta con Pabellon mediante la relación Asignado (1:N).",
      expected: {
        mode: "exact",
        entities: [
          {
            name: "Hospital",
            attributes: [
              { name: "id_hosp", isKey: true },
              { name: "nombre", isKey: false },
            ],
          },
          {
            name: "Pabellon",
            isWeak: true,
            attributes: [
              { name: "numero", isKey: true },
              { name: "piso", isKey: false },
            ],
          },
          {
            name: "Personal",
            attributes: [
              { name: "rut", isKey: true },
              { name: "nombre", isKey: false },
            ],
          },
          {
            name: "Medico",
            extendsName: "Personal",
            attributes: [{ name: "especialidad", isKey: false }],
          },
          {
            name: "Paciente",
            extendsName: "Personal",
            attributes: [{ name: "diagnostico", isKey: false }],
          },
        ],
        relationships: [
          {
            participants: [
              { entityName: "Pabellon", cardinality: "1", participation: "total" },
              { entityName: "Hospital", cardinality: "N" },
            ],
          },
          {
            name: "Atiende",
            participants: [
              { entityName: "Medico", cardinality: "N" },
              { entityName: "Paciente", cardinality: "M" },
            ],
          },
          {
            name: "Asignado",
            participants: [
              { entityName: "Pabellon", cardinality: "1" },
              { entityName: "Consulta", cardinality: "N" },
            ],
          },
        ],
        aggregations: [
          {
            name: "Consulta",
            aggregatedRelationshipName: "Atiende",
          },
        ],
      },
      starterCode: `// Integra: Entidad débil, Herencia (EXTENDS) y Agregación\n`,
    },
    2: {
      statement:
        "Desafío Final de la Biblioteca Comunitaria: Integraremos todo el sistema de la red de bibliotecas en un modelo conceptual completo.\n\nRequerimientos:\n1. La red posee Sucursales fuertes. Cada sucursal alberga Estantes físicos (entidad débil identificada localmente por su número de estante y su categoría temática).\n2. El catálogo clasifica los libros en formato general, con subclases LibroDigital y LibroImpreso usando herencia.\n3. La asignación física de libros impresos en los estantes se modela mediante una relación muchos a muchos llamada Ubicacion.\n4. Se debe agrupar la relación Ubicacion en una agregación para que un Inspector verifique las colocaciones mediante una relación de auditoría.",
      expected: {
        mode: "structural",
        entities: [
          SUCURSAL_SHAPE,
          ESTANTE_SHAPE,
          LIBRO_SHAPE,
          LIBRO_DIGITAL_SHAPE,
          LIBRO_IMPRESO_SHAPE,
          shape("Inspector", 2, 1),
        ],
        relationships: [
          {
            label: "Dependencia débil (Estante 1! - N Sucursal)",
            cardinalities: ["1", "N"],
            attributeCount: 0,
            totalParticipationsCount: 1,
          },
          {
            label: "Ubicación N:M (LibroImpreso - Estante)",
            cardinalities: ["M", "N"],
            attributeCount: 0,
          },
          {
            label: "Control (Inspector 1 - N Ubicación)",
            cardinalities: ["1", "N"],
            attributeCount: 0,
          },
        ],
        aggregations: [
          { label: "Agregación de Ubicación" },
        ],
      },
      starterCode: `// Modela el esquema conceptual completo de la biblioteca\n`,
    },
  },
};

export const getExercise = (
  level: LevelId,
  subLevel: SubLevelId,
): ExerciseDefinition | undefined => EXERCISES[level]?.[subLevel];

// --- Motor de Validación ---

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

// --- Validación Modo "exact" ---

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
  if (actualPart.isComposite) return true;

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
          p.participation === "total" ? "!" : ""
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

    // Validación de Herencia (EXTENDS)
    if (expectedEntity.extendsName) {
      const parentName =
        (actualEntity as unknown as { parentEntity?: string }).parentEntity ||
        (actualEntity as unknown as { extendsName?: string }).extendsName ||
        (actualEntity as unknown as { parentName?: string }).parentName;

      if (
        !parentName ||
        parentName.toLowerCase() !== expectedEntity.extendsName.toLowerCase()
      ) {
        missing.push(
          `La entidad "${expectedEntity.name}" debe heredar de "${expectedEntity.extendsName}" (usar EXTENDS ${expectedEntity.extendsName}).`,
        );
      }
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
          `La entidad "${expectedEntity.name}" tiene atributo(s) adicionales que no pide el enunciado: ${extraAttrs
            .map((a) => a.name)
            .join(", ")}.`,
        );
      }
    }
  }

  // Validación de Relaciones
  for (const expectedRel of expected.relationships ?? []) {
    const candidates = expectedRel.name
      ? erDoc.relationships.filter(
          (r) => r.name.toLowerCase() === expectedRel.name!.toLowerCase(),
        )
      : erDoc.relationships;

    const match = candidates.find((r) => relationshipMatches(r, expectedRel));

    if (!match) {
      missing.push(
        `Falta la relación ${describeExpectedRelationship(expectedRel)}.`,
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
          `A la relación "${match.name}" le falta(n) el/los atributo(s): ${missingAttrs.join(
            ", ",
          )}.`,
        );
      }
    }
  }

  // Validación de Agregaciones
  for (const expectedAgg of expected.aggregations ?? []) {
    const aggregationsList = (erDoc as unknown as { aggregations?: Array<{ name: string; aggregatedRelationshipName?: string; relationshipName?: string }> }).aggregations ?? [];
    const match = aggregationsList.find(
      (a) =>
        (!expectedAgg.name || a.name.toLowerCase() === expectedAgg.name.toLowerCase()) &&
        ((a.aggregatedRelationshipName && a.aggregatedRelationshipName.toLowerCase() === expectedAgg.aggregatedRelationshipName.toLowerCase()) ||
         (a.relationshipName && a.relationshipName.toLowerCase() === expectedAgg.aggregatedRelationshipName.toLowerCase()))
    );

    if (!match) {
      missing.push(
        `Falta definir la agregación "${expectedAgg.name || ""}" sobre la relación "${expectedAgg.aggregatedRelationshipName}".`,
      );
    }
  }

  return missing;
};

// --- Validación Modo "structural" ---

type EntityShapeKey = {
  attributeCount: number;
  keyAttributeCount: number;
  isWeak: boolean;
  hasParent: boolean;
};

const entityShapeKey = (s: EntityShapeKey): string =>
  `${s.attributeCount}:${s.keyAttributeCount}:${s.isWeak}:${s.hasParent}`;

const describeEntityShape = (s: EntityShapeKey): string =>
  `${s.attributeCount} atributo(s) (${s.keyAttributeCount} de tipo key)${
    s.isWeak ? ", entidad débil" : ""
  }${s.hasParent ? ", hereda de una superclase (EXTENDS)" : ""}`;

type RelationshipShapeKey = {
  cardinalities: string[];
  attributeCount: number;
  totalParticipationsCount: number;
};

const relationshipShapeKey = (s: RelationshipShapeKey): string =>
  `${[...s.cardinalities].sort().join(",")}:${s.attributeCount}:${s.totalParticipationsCount}`;

const describeRelationshipShape = (s: RelationshipShapeKey): string =>
  `cardinalidades ${s.cardinalities.join(":")}${
    s.totalParticipationsCount > 0 ? " con participación total (!)" : ""
  }, con ${s.attributeCount} atributo(s) propio(s)`;

const validateStructural = (
  erDoc: ER,
  expected: ExpectedAnswerStructural,
): string[] => {
  const missing: string[] = [];

  // 1. Conteo estructural de entidades
  const actualEntityShapeCounts = new Map<string, number>();
  for (const entity of erDoc.entities) {
    const hasParent = Boolean(
      (entity as unknown as { parentEntity?: string }).parentEntity ||
      (entity as unknown as { extendsName?: string }).extendsName ||
      (entity as unknown as { parentName?: string }).parentName
    );
    const key = entityShapeKey({
      attributeCount: entity.attributes.length,
      keyAttributeCount: entity.attributes.filter((a) => a.isKey).length,
      isWeak: entity.hasDependencies,
      hasParent,
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
      hasParent: entity.hasParent ?? false,
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

  // 2. Conteo estructural de relaciones
  if (expected.relationships) {
    const actualRelShapeCounts = new Map<string, number>();
    for (const relationship of erDoc.relationships) {
      const cardinalities = relationship.participantEntities.map((p) =>
        p.isComposite ? "?" : p.cardinality,
      );
      const totalParts = relationship.participantEntities.filter(
        (p) => p.participation === "total",
      ).length;

      const key = relationshipShapeKey({
        cardinalities,
        attributeCount: relationship.attributes.length,
        totalParticipationsCount: totalParts,
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
        totalParticipationsCount: rel.totalParticipationsCount ?? 0,
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

  // 3. Conteo estructural de agregaciones
  if (expected.aggregations) {
    const aggregationsList =
      (erDoc as unknown as { aggregations?: unknown[] }).aggregations ?? [];
    if (aggregationsList.length < expected.aggregations.length) {
      missing.push(
        `Falta definir ${expected.aggregations.length - aggregationsList.length} agregación(es) (aggregation Nombre (Relacion)).`,
      );
    }
  }

  return missing;
};