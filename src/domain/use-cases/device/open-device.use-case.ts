import { OpenDeviceDto } from "../../dtos/session/open-device.dto";
import { DeviceSessionEntity } from "../../entities/session/session.entity";
import { DeviceDatasource } from "../../datasources/device.datasource";
import { SessionRepository } from "../../repositories/session.repository";

/**
 * Use Case Interface
 */
export interface OpenDeviceUseCase {
    execute(dto: OpenDeviceDto): Promise<DeviceSessionEntity>;
}

/**
 * Use Case: Abrir dispositivo
 * 
 * Flujo completo:
 * 1. Llama al datasource para obtener token de Yappy
 * 2. Crea entity con sessionId auto-generado
 * 3. Persiste en repository (sessionId → token)
 * 4. Retorna entity al controller
 * 
 * Responsabilidades:
 * - Orquestar datasource + repository
 * - Aplicar lógica de negocio
 * - Coordinar múltiples operaciones
 */
export class OpenDevice implements OpenDeviceUseCase {
    
    /**
     * Dependency Injection
     * 
     * El use case necesita:
     * - Datasource: Para obtener token de Yappy (HTTP)
     * - Repository: Para persistir sessionId → token (JSON)
     */
    constructor(
        private readonly deviceDatasource: DeviceDatasource,
        private readonly sessionRepository: SessionRepository
    ) {}

    /**
     * Ejecuta el caso de uso
     * 
     * Este es el NÚCLEO de la lógica de negocio
     */
    async execute(dto: OpenDeviceDto): Promise<DeviceSessionEntity> {
        const token = await this.deviceDatasource.openDevice(dto);
        const session = DeviceSessionEntity.createNew(token);
        await this.sessionRepository.save(session);
        return session;
    }
}
