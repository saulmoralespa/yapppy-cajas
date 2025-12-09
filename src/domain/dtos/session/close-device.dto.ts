/**
 * DTO para cerrar una sesión de dispositivo
 * 
 * Valida que el sessionId sea válido antes de procesarlo
 */
export class CloseDeviceDto {
    
    private constructor(
        public readonly sessionId: string
    ) {}

    /**
     * Factory method con validaciones
     * 
     * @param object - Objeto con sessionId
     * @returns [error?, dto?] - Patrón Either para manejo de errores
     */
    static create(object: {[key: string]: any}): [string?, CloseDeviceDto?] {
        
        const { sessionId } = object;

        // Validación: sessionId requerido
        if (!sessionId) {
            return ['sessionId is required'];
        }

        // Validación: debe ser string
        if (typeof sessionId !== 'string') {
            return ['sessionId must be a string'];
        }

        // Validación: no debe estar vacío
        if (sessionId.trim() === '') {
            return ['sessionId cannot be empty'];
        }

        // Validación: formato UUID (opcional pero recomendado)
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(sessionId)) {
            return ['sessionId must be a valid UUID'];
        }
        
        return [
            undefined,
            new CloseDeviceDto(sessionId.trim())
        ];
    }
}
