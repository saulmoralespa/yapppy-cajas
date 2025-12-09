import { CloseDeviceDto } from "../../dtos/session/close-device.dto";
import { DeviceDatasource } from "../../datasources/device.datasource";
import { SessionRepository } from "../../repositories/session.repository";

/**
 * Use Case Interface
 */
export interface CloseDeviceUseCase {
    execute(dto: CloseDeviceDto): Promise<{
        transactions: number;
        amount: number;
    }>;
}

/**
 * Use Case: Cerrar dispositivo
 * 
 * Flujo completo:
 * 1. Busca la sesión en el repository por sessionId
 * 2. Si no existe, lanza error
 * 3. Obtiene el token asociado
 * 4. Llama al datasource para cerrar en Yappy
 * 5. Elimina la sesión del repository
 * 6. Retorna el resumen (transactions y amount)
 * 
 * Responsabilidades:
 * - Validar que la sesión existe
 * - Coordinar datasource + repository
 * - Manejar errores de negocio
 */
export class CloseDevice implements CloseDeviceUseCase {
    
    /**
     * Dependency Injection
     * 
     * Necesita:
     * - Repository: Para buscar y eliminar sesión
     * - Datasource: Para cerrar sesión en Yappy
     */
    constructor(
        private readonly deviceDatasource: DeviceDatasource,
        private readonly sessionRepository: SessionRepository
    ) {}

    /**
     * Ejecuta el caso de uso
     */
    async execute(dto: CloseDeviceDto): Promise<{
        transactions: number;
        amount: number;
    }> {
        // PASO 1: Buscar sesión en repository
        const session = await this.sessionRepository.findById(dto.sessionId);
        
        // PASO 2: Validar que existe
        if (!session) {
            throw new Error(`Session ${dto.sessionId} not found`);
        }
        
        // PASO 3: Cerrar sesión en Yappy y obtener resumen
        const summary = await this.deviceDatasource.closeDevice(session.token);
        
        // PASO 4: Eliminar del repository
        await this.sessionRepository.delete(dto.sessionId);
        
        // PASO 5: Retornar resumen
        return summary;
    }
}
