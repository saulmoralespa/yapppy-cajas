import { describe, test, expect, beforeEach, vi } from 'vitest';
import { CloseDevice } from '../../../../../src/domain/use-cases/device/close-device.use-case';
import { CloseDeviceDto } from '../../../../../src/domain/dtos/session/close-device.dto';
import { DeviceSessionEntity } from '../../../../../src/domain/entities/session/session.entity';

describe('CloseDevice UseCase', () => {
  // Mocks
  const mockDeviceDatasource = {
    openDevice: vi.fn(),
    closeDevice: vi.fn()
  };

  const mockSessionRepository = {
    findAll: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
    delete: vi.fn()
  };

  let useCase: CloseDevice;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    vi.clearAllMocks();
    
    // Crear nueva instancia del use case con mocks
    useCase = new CloseDevice(mockDeviceDatasource, mockSessionRepository);
  });

  describe('Flujo exitoso', () => {
    test('should close device and delete session', async () => {
      // Arrange
      const session = DeviceSessionEntity.createNew('token-123');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      mockSessionRepository.findById.mockResolvedValue(session);
      mockDeviceDatasource.closeDevice.mockResolvedValue(undefined);

      // Act
      await useCase.execute(dto!);

      // Assert
      expect(mockSessionRepository.findById).toHaveBeenCalledWith(session.sessionId);
      expect(mockDeviceDatasource.closeDevice).toHaveBeenCalledWith('token-123');
      expect(mockSessionRepository.delete).toHaveBeenCalledWith(session.sessionId);
    });

    test('should call findById with correct sessionId', async () => {
      const session = DeviceSessionEntity.createNew('token-abc');
      const sessionId = '12345678-1234-1234-1234-123456789abc'; // UUID válido
      const [, dto] = CloseDeviceDto.create({ sessionId });

      mockSessionRepository.findById.mockResolvedValue(session);
      mockDeviceDatasource.closeDevice.mockResolvedValue(undefined);

      await useCase.execute(dto!);

      expect(mockSessionRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockSessionRepository.findById).toHaveBeenCalledWith(sessionId);
    });

    test('should call closeDevice with session token', async () => {
      const session = DeviceSessionEntity.createNew('yappy-token-xyz');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      mockSessionRepository.findById.mockResolvedValue(session);
      mockDeviceDatasource.closeDevice.mockResolvedValue(undefined);

      await useCase.execute(dto!);

      expect(mockDeviceDatasource.closeDevice).toHaveBeenCalledTimes(1);
      expect(mockDeviceDatasource.closeDevice).toHaveBeenCalledWith('yappy-token-xyz');
    });

    test('should delete session after closing device', async () => {
      const session = DeviceSessionEntity.createNew('token-123');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      mockSessionRepository.findById.mockResolvedValue(session);
      mockDeviceDatasource.closeDevice.mockResolvedValue(undefined);

      await useCase.execute(dto!);

      expect(mockSessionRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockSessionRepository.delete).toHaveBeenCalledWith(session.sessionId);
    });
  });

  describe('Orden de ejecución', () => {
    test('should call methods in correct order', async () => {
      const session = DeviceSessionEntity.createNew('token-abc');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      const callOrder: string[] = [];

      mockSessionRepository.findById.mockImplementation(async () => {
        callOrder.push('findById');
        return session;
      });

      mockDeviceDatasource.closeDevice.mockImplementation(async () => {
        callOrder.push('closeDevice');
      });

      mockSessionRepository.delete.mockImplementation(async () => {
        callOrder.push('delete');
      });

      await useCase.execute(dto!);

      expect(callOrder).toEqual(['findById', 'closeDevice', 'delete']);
    });

    test('should not call closeDevice before findById', async () => {
      const session = DeviceSessionEntity.createNew('token-123');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      let findByIdCalled = false;

      mockSessionRepository.findById.mockImplementation(async () => {
        findByIdCalled = true;
        return session;
      });

      mockDeviceDatasource.closeDevice.mockImplementation(async () => {
        expect(findByIdCalled).toBe(true);
      });

      await useCase.execute(dto!);
    });

    test('should not call delete before closeDevice', async () => {
      const session = DeviceSessionEntity.createNew('token-123');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      let closeDeviceCalled = false;

      mockSessionRepository.findById.mockResolvedValue(session);

      mockDeviceDatasource.closeDevice.mockImplementation(async () => {
        closeDeviceCalled = true;
      });

      mockSessionRepository.delete.mockImplementation(async () => {
        expect(closeDeviceCalled).toBe(true);
      });

      await useCase.execute(dto!);
    });
  });

  describe('Manejo de errores - Sesión no encontrada', () => {
    test('should throw error when session not found', async () => {
      const sessionId = '11111111-1111-1111-1111-111111111111'; // UUID válido
      const [, dto] = CloseDeviceDto.create({ sessionId });
      mockSessionRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto!)).rejects.toThrow(`Session ${sessionId} not found`);
    });

    test('should throw error with correct message format', async () => {
      const sessionId = '22222222-2222-2222-2222-222222222222'; // UUID válido
      const [, dto] = CloseDeviceDto.create({ sessionId });
      mockSessionRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto!)).rejects.toThrow('not found');
    });

    test('should not call datasource if session not found', async () => {
      const sessionId = '33333333-3333-3333-3333-333333333333'; // UUID válido
      const [, dto] = CloseDeviceDto.create({ sessionId });
      mockSessionRepository.findById.mockResolvedValue(null);

      try {
        await useCase.execute(dto!);
      } catch (error) {
        // Expected error
      }

      expect(mockDeviceDatasource.closeDevice).not.toHaveBeenCalled();
      expect(mockSessionRepository.delete).not.toHaveBeenCalled();
    });

    test('should not delete session if not found', async () => {
      const sessionId = '44444444-4444-4444-4444-444444444444'; // UUID válido
      const [, dto] = CloseDeviceDto.create({ sessionId });
      mockSessionRepository.findById.mockResolvedValue(null);

      try {
        await useCase.execute(dto!);
      } catch (error) {
        // Expected error
      }

      expect(mockSessionRepository.delete).not.toHaveBeenCalled();
    });

    test('should check for null session', async () => {
      const sessionId = '55555555-5555-5555-5555-555555555555'; // UUID válido
      const [, dto] = CloseDeviceDto.create({ sessionId });
      mockSessionRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto!)).rejects.toThrow();
    });

    test('should check for undefined session', async () => {
      const sessionId = '66666666-6666-6666-6666-666666666666'; // UUID válido
      const [, dto] = CloseDeviceDto.create({ sessionId });
      mockSessionRepository.findById.mockResolvedValue(undefined);

      await expect(useCase.execute(dto!)).rejects.toThrow();
    });
  });

  describe('Manejo de errores - Datasource', () => {
    test('should propagate datasource errors', async () => {
      const session = DeviceSessionEntity.createNew('token-123');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      mockSessionRepository.findById.mockResolvedValue(session);
      mockDeviceDatasource.closeDevice.mockRejectedValue(
        new Error('Yappy API Error')
      );

      await expect(useCase.execute(dto!)).rejects.toThrow('Yappy API Error');
    });

    test('should not delete session if datasource fails', async () => {
      const session = DeviceSessionEntity.createNew('token-123');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      mockSessionRepository.findById.mockResolvedValue(session);
      mockDeviceDatasource.closeDevice.mockRejectedValue(new Error('API Error'));

      try {
        await useCase.execute(dto!);
      } catch (error) {
        // Expected error
      }

      expect(mockSessionRepository.delete).not.toHaveBeenCalled();
    });

    test('should propagate network errors', async () => {
      const session = DeviceSessionEntity.createNew('token-123');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      mockSessionRepository.findById.mockResolvedValue(session);
      mockDeviceDatasource.closeDevice.mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(useCase.execute(dto!)).rejects.toThrow('Network timeout');
    });

    test('should propagate authentication errors', async () => {
      const session = DeviceSessionEntity.createNew('token-123');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      mockSessionRepository.findById.mockResolvedValue(session);
      mockDeviceDatasource.closeDevice.mockRejectedValue(
        new Error('Invalid token')
      );

      await expect(useCase.execute(dto!)).rejects.toThrow('Invalid token');
    });
  });

  describe('Manejo de errores - Repository', () => {
    test('should propagate repository findById errors', async () => {
      const sessionId = '77777777-7777-7777-7777-777777777777'; // UUID válido
      const [, dto] = CloseDeviceDto.create({ sessionId });

      mockSessionRepository.findById.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(useCase.execute(dto!)).rejects.toThrow('Database connection failed');
    });

    test('should propagate repository delete errors', async () => {
      const session = DeviceSessionEntity.createNew('token-123');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      mockSessionRepository.findById.mockResolvedValue(session);
      mockDeviceDatasource.closeDevice.mockResolvedValue(undefined);
      mockSessionRepository.delete.mockRejectedValue(
        new Error('Failed to delete session')
      );

      await expect(useCase.execute(dto!)).rejects.toThrow('Failed to delete session');
    });
  });

  describe('Casos de uso reales', () => {
    test('should handle closing active session', async () => {
      const activeSession = DeviceSessionEntity.createNew('active-token-123');
      const [, dto] = CloseDeviceDto.create({ sessionId: activeSession.sessionId });

      mockSessionRepository.findById.mockResolvedValue(activeSession);
      mockDeviceDatasource.closeDevice.mockResolvedValue(undefined);
      mockSessionRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(dto!);

      expect(mockDeviceDatasource.closeDevice).toHaveBeenCalledWith('active-token-123');
      expect(mockSessionRepository.delete).toHaveBeenCalledWith(activeSession.sessionId);
    });

    test('should handle closing expired session', async () => {
      const sessionId = '88888888-8888-8888-8888-888888888888'; // UUID válido
      const oldTime = Date.now() - (7 * 60 * 60 * 1000);
      const expiredSession = DeviceSessionEntity.fromStorage(
        sessionId,
        'expired-token',
        oldTime,
        21600
      );
      const [, dto] = CloseDeviceDto.create({ sessionId });

      mockSessionRepository.findById.mockResolvedValue(expiredSession);
      mockDeviceDatasource.closeDevice.mockResolvedValue(undefined);
      mockSessionRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(dto!);

      expect(expiredSession.isExpired()).toBe(true);
      expect(mockDeviceDatasource.closeDevice).toHaveBeenCalled();
      expect(mockSessionRepository.delete).toHaveBeenCalled();
    });

    test('should handle closing session with UUID sessionId', async () => {
      const session = DeviceSessionEntity.createNew('token-uuid');
      const [, dto] = CloseDeviceDto.create({ 
        sessionId: '550e8400-e29b-41d4-a716-446655440000' 
      });

      mockSessionRepository.findById.mockResolvedValue(session);
      mockDeviceDatasource.closeDevice.mockResolvedValue(undefined);
      mockSessionRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(dto!);

      expect(mockSessionRepository.findById).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000'
      );
    });
  });

  describe('Verificación de llamadas a métodos', () => {
    test('should call each method exactly once', async () => {
      const session = DeviceSessionEntity.createNew('token-123');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      mockSessionRepository.findById.mockResolvedValue(session);
      mockDeviceDatasource.closeDevice.mockResolvedValue(undefined);
      mockSessionRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(dto!);

      expect(mockSessionRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockDeviceDatasource.closeDevice).toHaveBeenCalledTimes(1);
      expect(mockSessionRepository.delete).toHaveBeenCalledTimes(1);
    });

    test('should not call any method multiple times', async () => {
      const session = DeviceSessionEntity.createNew('token-123');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      mockSessionRepository.findById.mockResolvedValue(session);
      mockDeviceDatasource.closeDevice.mockResolvedValue(undefined);
      mockSessionRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(dto!);

      expect(mockSessionRepository.findById.mock.calls.length).toBe(1);
      expect(mockDeviceDatasource.closeDevice.mock.calls.length).toBe(1);
      expect(mockSessionRepository.delete.mock.calls.length).toBe(1);
    });
  });

  describe('Independencia de mocks', () => {
    test('mocks should be isolated between tests', async () => {
      const session = DeviceSessionEntity.createNew('token-123');
      const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

      mockSessionRepository.findById.mockResolvedValue(session);
      mockDeviceDatasource.closeDevice.mockResolvedValue(undefined);
      mockSessionRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(dto!);

      // Los mocks deberían estar limpios para cada test
      expect(mockDeviceDatasource.closeDevice).toHaveBeenCalledTimes(1);
    });
  });
});
