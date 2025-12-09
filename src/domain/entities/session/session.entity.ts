import { randomUUID } from 'crypto';

/**
 * Entity que representa una sesión de dispositivo abierta con Yappy
 * 
 * ¿Por qué una Entity?
 * - Tiene identidad (sessionId - auto-generado con UUID)
 * - Encapsula el token obtenido de Yappy
 * - Representa un concepto del dominio
 * 
 * IMPORTANTE: Guardamos sessionId, token, createdAt y expiresIn
 * Usamos timestamps y segundos para evitar problemas con zonas horarias
 */
export class DeviceSessionEntity {
    public readonly sessionId: string;
    public readonly createdAt: number; // Unix timestamp en milisegundos
    public readonly expiresIn: number; // Segundos hasta expiración
    
    /**
     * Constructor privado - solo se puede crear mediante factory methods
     * 
     * @param token - Token retornado por Yappy
     * @param sessionId - UUID único (se genera automáticamente si no se provee)
     * @param createdAt - Timestamp de creación (milisegundos)
     * @param expiresIn - Tiempo de expiración en segundos (21600 = 6 horas por defecto)
     */
    private constructor(
        public readonly token: string,
        sessionId?: string,
        createdAt?: number,
        expiresIn: number = 21600 // 6 horas en segundos
    ) {
        // Si no hay sessionId, generamos uno nuevo (UUID v4)
        this.sessionId = sessionId || randomUUID();
        
        // Si no hay createdAt, usar timestamp actual
        this.createdAt = createdAt || Date.now();
        
        // Establecer tiempo de expiración (por defecto 6 horas = 21600 segundos)
        this.expiresIn = expiresIn;
    }

    /**
     * Factory method: Crea una NUEVA sesión
     * 
     * Uso: Cuando el API de Yappy retorna un token nuevo
     * Genera automáticamente un sessionId único, createdAt y expiresIn (6 horas)
     * 
     * @param token - Token retornado por Yappy
     */
    static createNew(token: string): DeviceSessionEntity {
        if (!token) throw new Error('Token is required');
        
        // Genera sessionId, createdAt (now) y expiresIn (6 horas) automáticamente
        return new DeviceSessionEntity(token);
    }

    /**
     * Factory method: Reconstruye una sesión desde storage
     * 
     * Uso: Cuando recuperamos datos del archivo JSON
     * 
     * @param sessionId - ID de sesión existente
     * @param token - Token almacenado
     * @param createdAt - Timestamp de creación (milisegundos)
     * @param expiresIn - Tiempo de expiración en segundos
     */
    static fromStorage(
        sessionId: string,
        token: string,
        createdAt?: number,
        expiresIn?: number
    ): DeviceSessionEntity {
        if (!sessionId) throw new Error('Session ID is required');
        if (!token) throw new Error('Token is required');
        
        return new DeviceSessionEntity(token, sessionId, createdAt, expiresIn);
    }

    /**
     * Verifica si la sesión ha expirado
     * Compara el timestamp actual con createdAt + expiresIn
     */
    isExpired(): boolean {
        const expirationTimestamp = this.createdAt + (this.expiresIn * 1000);
        return Date.now() >= expirationTimestamp;
    }

    /**
     * Obtiene el timestamp de expiración
     */
    getExpirationTimestamp(): number {
        return this.createdAt + (this.expiresIn * 1000);
    }

    /**
     * Convierte la entidad a formato para almacenamiento
     * Incluye sessionId, token, createdAt (timestamp) y expiresIn (segundos)
     */
    toStorage() {
        return {
            sessionId: this.sessionId,
            token: this.token,
            createdAt: this.createdAt,
            expiresIn: this.expiresIn
        };
    }

    /**
     * Convierte la entidad a un objeto plano para respuestas HTTP
     */
    toJSON() {
        return {
            sessionId: this.sessionId,
            token: this.token,
            createdAt: this.createdAt,
            expiresIn: this.expiresIn,
            expiresAt: new Date(this.getExpirationTimestamp()).toISOString(),
            isExpired: this.isExpired()
        };
    }
}