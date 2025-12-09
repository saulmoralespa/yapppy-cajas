import { promises as fs } from 'fs';
import { join } from 'path';
import { DeviceSessionEntity } from '../../domain/entities/session/session.entity';
import { SessionRepository } from '../../domain/repositories/session.repository';

/**
 * Implementación del SessionRepository usando archivo JSON
 * 
 * ¿Por qué esta clase vive en infrastructure?
 * - Conoce detalles de implementación (filesystem, JSON)
 * - Usa librerías del sistema (fs, path)
 * - Puede cambiar sin afectar el dominio
 * 
 * Estructura del archivo sessions.json:
 * {
 *   "uuid-1234": {
 *     "token": "token-abc",
 *     "createdAt": 1733673600000,
 *     "expiresIn": 21600
 *   },
 *   "uuid-5678": {
 *     "token": "token-xyz",
 *     "createdAt": 1733677200000,
 *     "expiresIn": 21600
 *   }
 * }
 */
export class JsonSessionRepositoryImpl implements SessionRepository {
    
    private readonly filePath: string;
    
    /**
     * @param dataDir - Directorio donde se guardará sessions.json
     */
    constructor(dataDir: string = './data') {
        this.filePath = join(dataDir, 'sessions.json');
    }

    /**
     * Guarda una sesión en el archivo JSON
     * 
     * Flujo:
     * 1. Lee el archivo (o crea objeto vacío si no existe)
     * 2. Agrega/actualiza la sesión
     * 3. Escribe el archivo
     */
    async save(session: DeviceSessionEntity): Promise<void> {
        try {
            // 1. Leer archivo existente
            const sessions = await this.readFile();
            
            // 2. Agregar/actualizar sesión con token, createdAt y expiresIn
            sessions[session.sessionId] = {
                token: session.token,
                createdAt: session.createdAt,
                expiresIn: session.expiresIn
            };
            
            // 3. Escribir archivo
            await this.writeFile(sessions as Record<string, { token: string; createdAt: number; expiresIn: number }>);
            
        } catch (error: any) {
            console.error('❌ [Repository] Error saving session:', error);
            throw new Error(`Failed to save session: ${error.message}`);
        }
    }

    /**
     * Busca una sesión por ID
     */
    async findById(sessionId: string): Promise<DeviceSessionEntity | null> {
        try {
            const sessions = await this.readFile();
            const sessionData = sessions[sessionId];
            
            if (!sessionData) {
                return null;
            }
            
            // Reconstruir entity desde storage con createdAt y expiresIn
            return DeviceSessionEntity.fromStorage(
                sessionId,
                typeof sessionData === 'string' ? sessionData : sessionData.token,
                typeof sessionData === 'object' ? sessionData.createdAt : undefined,
                typeof sessionData === 'object' ? sessionData.expiresIn : undefined
            );
            
        } catch (error: any) {
            console.error('❌ [Repository] Error finding session:', error);
            return null;
        }
    }

    /**
     * Elimina una sesión
     */
    async delete(sessionId: string): Promise<void> {
        try {
            const sessions = await this.readFile();
            delete sessions[sessionId];
            await this.writeFile(sessions as Record<string, { token: string; createdAt: number; expiresIn: number }>);
            
        } catch (error: any) {
            console.error('❌ [Repository] Error deleting session:', error);
            throw new Error(`Failed to delete session: ${error.message}`);
        }
    }

    /**
     * Lista todas las sesiones
     */
    async findAll(): Promise<DeviceSessionEntity[]> {
        try {
            const sessions = await this.readFile();
            
            return Object.entries(sessions).map(([sessionId, sessionData]) =>
                DeviceSessionEntity.fromStorage(
                    sessionId,
                    typeof sessionData === 'string' ? sessionData : sessionData.token,
                    typeof sessionData === 'object' ? sessionData.createdAt : undefined,
                    typeof sessionData === 'object' ? sessionData.expiresIn : undefined
                )
            );
            
        } catch (error: any) {
            console.error('❌ [Repository] Error listing sessions:', error);
            return [];
        }
    }

    /**
     * Lee el archivo JSON
     * Si no existe, retorna objeto vacío
     */
    private async readFile(): Promise<Record<string, { token: string; createdAt: number; expiresIn: number } | string>> {
        try {
            // Verificar si el archivo existe
            await fs.access(this.filePath);
            
            // Leer contenido
            const content = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(content);
            
        } catch (error: any) {
            // Si el archivo no existe, retornar objeto vacío
            if (error.code === 'ENOENT') {
                console.log('📁 [Repository] Creating new sessions.json file');
                return {};
            }
            throw error;
        }
    }

    /**
     * Escribe el archivo JSON
     * Crea el directorio si no existe
     */
    private async writeFile(sessions: Record<string, { token: string; createdAt: number; expiresIn: number }>): Promise<void> {
        try {
            // Crear directorio si no existe
            const dir = join(this.filePath, '..');
            await fs.mkdir(dir, { recursive: true });
            
            // Escribir archivo con formato legible
            await fs.writeFile(
                this.filePath,
                JSON.stringify(sessions, null, 2),
                'utf-8'
            );
            
        } catch (error: any) {
            throw new Error(`Failed to write sessions file: ${error.message}`);
        }
    }
}
