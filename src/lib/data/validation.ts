import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020";

interface DatabaseSchema {
  $id: string;
  fileSchemas: Record<string, string>;
  [key: string]: unknown;
}

export class DataValidationError extends Error {
  constructor(
    message: string,
    readonly fileName: string,
    readonly pointer: string,
  ) {
    super(message);
    this.name = "DataValidationError";
  }
}

export function parseJsonDocument<T>(fileName: string, content: string): T {
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Bilinmeyen JSON hatası";
    throw new DataValidationError(`${fileName}: geçersiz JSON — ${detail}`, fileName, "/");
  }
}

function describeError(error: ErrorObject): string {
  const pointer = error.instancePath || "/";
  const detail = error.message ?? "şema doğrulaması başarısız";
  return `${pointer}: ${detail}`;
}

export function createDatabaseValidator(schema: DatabaseSchema) {
  const { fileSchemas, ...jsonSchema } = schema;
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    strictRequired: false,
    strictTypes: false,
    allowUnionTypes: true,
  });
  ajv.addSchema(jsonSchema);

  const validators = new Map<string, ValidateFunction>();
  for (const [fileName, reference] of Object.entries(fileSchemas)) {
    validators.set(fileName, ajv.compile({ $ref: `${schema.$id}${reference}` }));
  }

  return function validateFile(fileName: string, value: unknown): void {
    const validate = validators.get(fileName);
    if (!validate) {
      throw new DataValidationError(`${fileName}: kayıtlı dosya şeması bulunamadı`, fileName, "/");
    }
    if (validate(value)) return;

    const firstError = validate.errors?.[0];
    const pointer = firstError?.instancePath || "/";
    const details = (validate.errors ?? []).slice(0, 5).map(describeError).join("; ");
    throw new DataValidationError(`${fileName}: ${details}`, fileName, pointer);
  };
}
