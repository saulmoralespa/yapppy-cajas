import { DeviceSessionEntity } from "../entities/session/session.entity";

/**
 * Session Repository Interface (Puerto en Arquitectura Hexagonal)
 * 
 * ¿Por qué una interface de Repository?
 * - Define el CONTRATO de persistencia que necesita el dominio
 * - El dominio NO conoce DÓNDE se guardan los datos (JSON, Redis, DB, etc.)
 * - Permite cambiar la implementación sin tocar el dominio
 * - Facilita testing (puedes crear InMemorySessionRepository para tests)
 * 
 * Esta interface vive en el DOMINIO, pero las implementaciones
 * viven en INFRASTRUCTURE
 * 
 * Responsabilidad: Persistir la relación sessionId → token
 */
export abstract class SessionRepository {
    
    /**
     * Guarda una sesión (sessionId → token)
     * 
     * Si el sessionId ya existe, lo sobrescribe
     * 
     * @param session - Entity con sessionId y token
     */
    abstract save(session: DeviceSessionEntity): Promise<void>;

    /**
     * Busca una sesión por su ID
     * 
     * @param sessionId - UUID de la sesión
     * @returns Entity si existe, null si no se encuentra
     */
    abstract findById(sessionId: string): Promise<DeviceSessionEntity | null>;

    /**
     * Elimina una sesión
     * 
     * @param sessionId - UUID de la sesión a eliminar
     */
    abstract delete(sessionId: string): Promise<void>;

    /**
     * Lista todas las sesiones activas (opcional)
     * Útil para debugging o administración
     */
    abstract findAll(): Promise<DeviceSessionEntity[]>;
}
