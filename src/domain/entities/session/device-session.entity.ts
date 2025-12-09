/**
 * Entity que representa una sesión de dispositivo abierta con Yappy
 * 
 * ¿Por qué una Entity?
 * - Tiene identidad (sessionId)
 * - Contiene lógica de negocio (isExpired, timeRemaining)
 * - Representa un concepto del dominio
 */
export class DeviceSessionEntity {
    
    constructor(
        public readonly status: string,      // Estado de la sesión
        public readonly token: string,          // Token de autenticación
        public readonly opened_date: Date,        // Cuándo se abrió la sesión
    ) {}

    /**
     * Factory method - crea la entidad desde un objeto plano
     * 
     * ¿Por qué fromObject?
     * - Valida los datos antes de crear la entidad
     * - Transforma tipos (string → Date)
     * - Centraliza la creación
     */
    static fromObject(object: { [key: string]: any }): DeviceSessionEntity {
        const { status, token, opened_date } = object;

        // Validaciones de negocio
        if (!status) throw new Error('Status is required');
        if (!token) throw new Error('Token is required');
        if (!opened_date) throw new Error('Opened date is required');

        return new DeviceSessionEntity(
            status,
            token,
            new Date(opened_date) // Transforma string a Date
        );
    }

    /**
     * Lógica de negocio: ¿La sesión está expirada?
     * 
     * Esta lógica vive en la entidad porque es una
     * regla del dominio, no de infraestructura
     */
    // isExpired(): boolean {
    //     return new Date() > this.expiresAt;
    // }

    /**
     * Convierte la entidad a un objeto plano para respuestas HTTP
     */
    toJSON() {
        return {
            status: this.status,
            token: this.token,
            opened_date: this.opened_date.toISOString()
        };
    }
}